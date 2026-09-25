import { currentJob, isClosed, isFree, queue } from './queue'
import { SCRIPT, type ScriptEvent } from './script'
import { SEED } from './seed'
import { SECOND, SIM_START } from './time'
import { triage } from './triage'
import {
  TECHNICIANS,
  type Actor,
  type Channel,
  type LogKind,
  type PendingEffect,
  type ServiceRequest,
  type SimState,
  type TechId,
  type UpdateStatus,
  type Urgency,
} from './types'

export type Action =
  | { type: 'tick' }
  | { type: 'reset' }
  | { type: 'set-running'; running: boolean }
  | { type: 'toggle-auto-assign' }
  | { type: 'assign'; requestId: string; tech: TechId | null }
  | { type: 'set-urgency'; requestId: string; urgency: Urgency }
  | { type: 'status-update'; requestId: string; note: string; status?: UpdateStatus; by: Actor }
  | { type: 'complete'; requestId: string; note: string; by: Actor }

/**
 * Every change — operator clicks, technician actions and scripted events — goes
 * through this reducer, so logging, customer notifications and auto-assignment
 * behave the same whoever triggers them. It clones the state and mutates the copy.
 */
export function reducer(state: SimState, action: Action): SimState {
  if (action.type === 'reset') return initialState()
  const s = structuredClone(state)
  apply(s, action)
  return s
}

export function initialState(): SimState {
  const s: SimState = {
    now: SIM_START,
    running: true,
    autoAssign: true,
    requests: [],
    log: [],
    pending: [],
    nextLogId: 1,
    nextRequestNumber: 109,
  }
  log(s, 'system', `Imported ${SEED.length} requests from the coordinator's spreadsheet.`)

  for (const row of [...SEED].sort((a, b) => a.receivedAt - b.receivedAt)) {
    const t = triage(row.message)
    const original = t.followUp ? latestOpenRequest(s, row.customer) : undefined
    const request: ServiceRequest = {
      ...row,
      urgency: t.urgency,
      urgencyReason: t.reason,
      urgencySource: 'ai',
      needsInfo: t.needsInfo,
      hint: t.resolved ? 'Customer says the issue is resolved' : undefined,
      declinedBy: [],
      updates: [],
    }
    s.requests.push(request)
    if (original) {
      request.status = 'Merged'
      request.duplicateOf = original.id
      request.closedAt = s.now
      log(s, 'ai', `${row.id} is a follow-up from ${row.customer} on ${original.id}. Merged as a duplicate.`, row.id)
    } else {
      logTriage(s, request)
    }
  }
  s.requests.sort((a, b) => a.id.localeCompare(b.id))
  return s
}

function apply(s: SimState, action: Action): void {
  switch (action.type) {
    case 'tick':
      tick(s)
      return
    case 'set-running':
      s.running = action.running
      log(s, 'operator', action.running ? 'Simulation resumed.' : 'Simulation paused.')
      return
    case 'toggle-auto-assign':
      s.autoAssign = !s.autoAssign
      log(s, 'operator', `Auto-assign turned ${s.autoAssign ? 'on' : 'off'}.`)
      return
    case 'assign': {
      const r = find(s, action.requestId)
      if (r && !isClosed(r.status)) assign(s, r, action.tech, 'operator')
      return
    }
    case 'set-urgency': {
      const r = find(s, action.requestId)
      if (!r || r.urgency === action.urgency) return
      log(s, 'operator', `Urgency of ${r.id} changed from ${r.urgency} to ${action.urgency}.`, r.id)
      r.urgency = action.urgency
      r.urgencySource = 'operator'
      r.urgencyReason = 'set by operator'
      return
    }
    case 'status-update': {
      const r = find(s, action.requestId)
      if (r && !isClosed(r.status)) statusUpdate(s, r, action.note, action.status, action.by)
      return
    }
    case 'complete': {
      const r = find(s, action.requestId)
      if (r && !isClosed(r.status)) complete(s, r, action.note, action.by)
      return
    }
  }
}

/**
 * Chained consequences land one second after their cause: pending effects due now
 * run first, then auto-assign sees technicians freed during the previous second,
 * then this second's scripted events fire.
 */
function tick(s: SimState): void {
  s.now += SECOND
  const due = s.pending.filter((e) => e.at <= s.now)
  s.pending = s.pending.filter((e) => e.at > s.now)
  for (const effect of due) runEffect(s, effect)
  if (s.autoAssign) autoAssign(s)
  const elapsed = Math.round((s.now - SIM_START) / SECOND)
  for (const event of SCRIPT) if (event.at === elapsed) runScripted(s, event)
}

function later(s: SimState, effect: DistributiveOmit<PendingEffect, 'at'>): void {
  s.pending.push({ ...effect, at: s.now + SECOND } as PendingEffect)
}

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never

function runEffect(s: SimState, effect: PendingEffect): void {
  switch (effect.kind) {
    case 'triage':
      triageMessage(s, effect.channel, effect.customer, effect.message, effect.receivedAt)
      return
    case 'notify': {
      const via: Record<Channel, string> = { Email: 'Email', WhatsApp: 'WhatsApp', Phone: 'SMS to the calling number' }
      const r = find(s, effect.requestId)
      if (r) log(s, 'notify', `${via[effect.channel]} → ${r.customer}: "${effect.text}"`, r.id)
    }
  }
}

function runScripted(s: SimState, event: ScriptEvent): void {
  switch (event.kind) {
    case 'ingest':
      ingest(s, event.channel, event.customer, event.message)
      return
    case 'system':
      log(s, 'system', event.text)
      return
    case 'tech-update':
    case 'tech-complete': {
      const r = event.requestId ? find(s, event.requestId) : currentJob(s.requests, event.tech)
      if (!r || r.technician !== event.tech || isClosed(r.status)) return
      if (event.kind === 'tech-update') statusUpdate(s, r, event.note, event.status, event.tech)
      else complete(s, r, event.note, event.tech)
    }
  }
}

function ingest(s: SimState, channel: Channel, customer: string, message: string): void {
  log(s, 'ingest', `New ${channel} message from ${customer}: "${message}"`)
  later(s, { kind: 'triage', channel, customer, message, receivedAt: s.now })
}

function triageMessage(s: SimState, channel: Channel, customer: string, message: string, receivedAt: number): void {
  const t = triage(message)
  const original = t.followUp ? latestOpenRequest(s, customer) : undefined
  if (original) {
    log(s, 'ai', `Follow-up from ${customer} on ${original.id}. No new request created; sending a status reply.`, original.id)
    notify(s, original, statusSummary(original), channel)
    return
  }
  const request: ServiceRequest = {
    id: `R${s.nextRequestNumber++}`,
    receivedAt,
    channel,
    customer,
    message,
    urgency: t.urgency,
    urgencyReason: t.reason,
    urgencySource: 'ai',
    status: 'Queued',
    technician: null,
    needsInfo: t.needsInfo,
    hint: t.resolved ? 'Customer says the issue is resolved' : undefined,
    declinedBy: [],
    updates: [],
  }
  s.requests.push(request)
  logTriage(s, request)
  notify(s, request, `We received your request (${request.id}) and will keep you updated here.`)
}

function autoAssign(s: SimState): void {
  for (const tech of TECHNICIANS) {
    if (!isFree(s.requests, tech)) continue
    const next = queue(s.requests).find((r) => !r.declinedBy.includes(tech))
    if (next) assign(s, next, tech, 'system')
  }
}

function assign(s: SimState, r: ServiceRequest, tech: TechId | null, by: Actor): void {
  const previous = r.technician
  if (previous === tech) return
  r.technician = tech

  if (tech === null) {
    r.status = 'Queued'
    if (previous) r.declinedBy.push(previous)
    log(s, 'operator', `${previous} unassigned from ${r.id}. Back in the queue.`, r.id)
    return
  }

  r.status = 'Assigned'
  r.declinedBy = r.declinedBy.filter((t) => t !== tech)
  const kind: LogKind = by === 'system' ? 'assign' : 'operator'
  const how = by === 'system' ? `Auto-assigned ${r.id} (${r.urgency}) to ${tech}, who is free.` : `${r.id} assigned to ${tech}.`
  log(s, kind, previous ? `${how} Previously ${previous}.` : how, r.id)
  notify(s, r, `Technician ${tech} has been assigned to your request ${r.id}.`)
}

function statusUpdate(s: SimState, r: ServiceRequest, note: string, status: UpdateStatus | undefined, by: Actor): void {
  const next = status ?? (r.status === 'Assigned' ? 'In progress' : r.status)
  const changed = next !== r.status
  r.status = next
  r.needsInfo = false
  r.updates.push({ at: s.now, by, note })
  log(s, by === 'operator' ? 'operator' : 'tech', `${by === 'operator' ? 'Operator' : by} on ${r.id}${changed ? ` (${next})` : ''}: ${note}`, r.id)
  notify(s, r, `Update on ${r.id}: ${note}`)
}

function complete(s: SimState, r: ServiceRequest, note: string, by: Actor): void {
  r.status = 'Completed'
  r.closedAt = s.now
  r.hint = undefined
  r.needsInfo = false
  r.updates.push({ at: s.now, by, note })
  log(s, by === 'operator' ? 'operator' : 'tech', `${by === 'operator' ? 'Operator' : by} completed ${r.id}: ${note}`, r.id)
  notify(s, r, `Your request ${r.id} is complete. ${note}`)
}

/**
 * Replies go out a second later, on the channel the customer used: the request's
 * own, or the follow-up's.
 */
function notify(s: SimState, r: ServiceRequest, text: string, channel: Channel = r.channel): void {
  later(s, { kind: 'notify', requestId: r.id, channel, text })
}

function statusSummary(r: ServiceRequest): string {
  const state: Record<ServiceRequest['status'], string> = {
    Queued: 'in the queue for the next free technician',
    Assigned: `assigned to technician ${r.technician}`,
    'In progress': `in progress with technician ${r.technician}`,
    'Waiting for part': `waiting for a replacement part (technician ${r.technician})`,
    Completed: 'complete',
    Merged: 'merged into another request',
  }
  const last = r.updates.at(-1)
  return `Your request ${r.id} is ${state[r.status]}.${last ? ` Latest update: ${last.note}` : ''}`
}

function logTriage(s: SimState, r: ServiceRequest): void {
  const extras = [r.needsInfo && 'missing equipment details, call back to clarify', r.hint].filter(Boolean)
  log(s, 'ai', `Triage ${r.id}: ${r.urgency} (${r.urgencyReason})${extras.length ? `. Flag: ${extras.join('; ')}` : ''}.`, r.id)
}

function latestOpenRequest(s: SimState, customer: string): ServiceRequest | undefined {
  return s.requests
    .filter((r) => r.customer === customer && !isClosed(r.status))
    .sort((a, b) => b.receivedAt - a.receivedAt)[0]
}

function find(s: SimState, id: string): ServiceRequest | undefined {
  return s.requests.find((r) => r.id === id)
}

function log(s: SimState, kind: LogKind, text: string, requestId?: string): void {
  s.log.push({ id: s.nextLogId++, at: s.now, kind, text, requestId })
}
