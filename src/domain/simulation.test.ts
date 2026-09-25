import { describe, expect, it } from 'vitest'
import { compareQueue, isFree, queue } from './queue'
import { initialState, reducer, type Action } from './simulation'
import { triage } from './triage'
import type { ServiceRequest, SimState } from './types'

function run(state: SimState, ...actions: Action[]): SimState {
  return actions.reduce(reducer, state)
}

function ticks(state: SimState, n: number): SimState {
  for (let i = 0; i < n; i++) state = reducer(state, { type: 'tick' })
  return state
}

const byId = (s: SimState, id: string) => s.requests.find((r) => r.id === id)!

describe('triage', () => {
  it.each([
    ['Cold-room unit keeps stopping. Stored goods could be affected.', 'Critical'],
    ['Machine not working. Please call us.', 'High'],
    ['Please send someone today for a pressure warning.', 'High'],
    ['Routine inspection request for next week.', 'Low'],
    ['Thanks, the unit is running again.', 'Normal'],
    ['Strong gas smell near the boiler room, please send someone urgently.', 'Critical'],
  ])('%s → %s', (message, urgency) => {
    expect(triage(message).urgency).toBe(urgency)
  })

  it('flags vague messages and follow-ups', () => {
    expect(triage('Machine not working. Please call us.').needsInfo).toBe(true)
    expect(triage('Any update on the pump? We are still waiting.').followUp).toBe(true)
  })
})

describe('queue', () => {
  it('puts the oldest request of the highest urgency first', () => {
    const r = (id: string, urgency: ServiceRequest['urgency'], receivedAt: number) =>
      ({ id, urgency, receivedAt }) as ServiceRequest
    const sorted = [r('a', 'High', 2), r('b', 'Critical', 5), r('c', 'High', 1), r('d', 'Critical', 3)].sort(compareQueue)
    expect(sorted.map((x) => x.id)).toEqual(['d', 'b', 'c', 'a'])
  })
})

describe('seed', () => {
  it('merges R104 into R101 and triages the rest', () => {
    const s = initialState()
    expect(byId(s, 'R104')).toMatchObject({ status: 'Merged', duplicateOf: 'R101' })
    expect(byId(s, 'R101').urgency).toBe('Critical')
    expect(queue(s.requests).map((r) => r.id)).toEqual(['R101', 'R105', 'R108', 'R103'])
  })
})

describe('auto-assign', () => {
  it('assigns the head of the queue to a free technician on the next tick', () => {
    const s = ticks(initialState(), 1)
    expect(byId(s, 'R101').technician).toBe('T2')
  })

  it('does nothing while turned off', () => {
    const s = ticks(run(initialState(), { type: 'toggle-auto-assign' }), 1)
    expect(byId(s, 'R101').technician).toBeNull()
  })

  it("doesn't hand a request back to the technician the operator took off it", () => {
    let s = ticks(initialState(), 1)
    s = ticks(run(s, { type: 'assign', requestId: 'R101', tech: null }), 1)
    expect(byId(s, 'R101').technician).toBeNull()
    expect(byId(s, 'R105').technician).toBe('T2')
  })
})

describe('chained events', () => {
  it('notifies the customer one second after a status update', () => {
    let s = run(initialState(), { type: 'status-update', requestId: 'R102', note: 'On my way.', by: 'T1' })
    const isReply = (e: SimState['log'][number]) => e.kind === 'notify' && e.text.includes('On my way.')
    expect(s.log.some(isReply)).toBe(false)
    s = ticks(s, 1)
    expect(s.log.find(isReply)?.at).toBe(s.now)
  })
})

describe('scripted demo', () => {
  const at180 = ticks(initialState(), 180)
  const at450 = ticks(at180, 270)

  it('shows every feature within the first three minutes', () => {
    const kinds = new Set(at180.log.map((e) => e.kind))
    for (const kind of ['ingest', 'ai', 'assign', 'tech', 'notify']) expect(kinds).toContain(kind)
    expect(at180.log.some((e) => e.text.includes('Follow-up from C02 on R102'))).toBe(true)
    expect(at180.requests.filter((r) => r.status === 'Completed').length).toBeGreaterThanOrEqual(3)
  })

  it('keeps technicians busy through the whole script', () => {
    expect(byId(at450, 'R112')).toMatchObject({ status: 'Completed', technician: 'T3' })
    expect(byId(at450, 'R103').technician).toBe('T3')
    expect(byId(at450, 'R110').technician).toBe('T2')
    expect(isFree(at450.requests, 'T1')).toBe(true)
    expect(at450.log.at(-1)?.text).toContain('Scripted demo events finished')
  })
})
