export type Channel = 'Email' | 'WhatsApp' | 'Phone'

export type Urgency = 'Critical' | 'High' | 'Normal' | 'Low'

export const URGENCIES: Urgency[] = ['Critical', 'High', 'Normal', 'Low']

export type TechId = 'T1' | 'T2' | 'T3'

export const TECHNICIANS: TechId[] = ['T1', 'T2', 'T3']

export type RequestStatus =
  | 'Queued'
  | 'Assigned'
  | 'In progress'
  | 'Waiting for part'
  | 'Completed'
  | 'Merged'

/** Statuses a technician or operator can set through a status update. */
export type UpdateStatus = 'In progress' | 'Waiting for part'

export type Actor = 'operator' | 'system' | TechId

export interface StatusNote {
  at: number
  by: Actor
  note: string
}

export interface ServiceRequest {
  id: string
  receivedAt: number
  channel: Channel
  customer: string
  message: string
  urgency: Urgency
  urgencyReason: string
  urgencySource: 'ai' | 'operator'
  status: RequestStatus
  technician: TechId | null
  needsInfo: boolean
  /** AI hint worth surfacing to the operator, e.g. "customer says it's resolved". */
  hint?: string
  duplicateOf?: string
  /** Technicians the operator took off this request; auto-assign won't hand it back to them. */
  declinedBy: TechId[]
  updates: StatusNote[]
  closedAt?: number
}

export type LogKind = 'ingest' | 'ai' | 'assign' | 'tech' | 'notify' | 'operator' | 'system'

export interface LogEntry {
  id: number
  at: number
  kind: LogKind
  text: string
  requestId?: string
}

/** A consequence of an event, deferred so chained events show up one second apart. */
export type PendingEffect = { at: number } & (
  | { kind: 'triage'; channel: Channel; customer: string; message: string; receivedAt: number }
  | { kind: 'notify'; requestId: string; channel: Channel; text: string }
)

export interface SimState {
  now: number
  running: boolean
  autoAssign: boolean
  requests: ServiceRequest[]
  log: LogEntry[]
  pending: PendingEffect[]
  nextLogId: number
  nextRequestNumber: number
}
