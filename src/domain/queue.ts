import { HOUR } from './time'
import type { RequestStatus, ServiceRequest, TechId, Urgency } from './types'

const URGENCY_RANK: Record<Urgency, number> = { Critical: 3, High: 2, Normal: 1, Low: 0 }

/**
 * Assumed response targets per urgency (not supplied by Atlas), measured from when
 * the request was received.
 */
export const RESPONSE_TARGET: Record<Urgency, number> = {
  Critical: 4 * HOUR,
  High: 8 * HOUR,
  Normal: 48 * HOUR,
  Low: 7 * 24 * HOUR,
}

export function isClosed(status: RequestStatus): boolean {
  return status === 'Completed' || status === 'Merged'
}

/** Assigned or in progress. A job waiting for a part doesn't keep its technician busy. */
export function isActiveWork(status: RequestStatus): boolean {
  return status === 'Assigned' || status === 'In progress'
}

/** Head of the queue first: highest urgency, then oldest within that urgency. */
export function compareQueue(a: ServiceRequest, b: ServiceRequest): number {
  return URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency] || a.receivedAt - b.receivedAt
}

export function queue(requests: ServiceRequest[]): ServiceRequest[] {
  return requests.filter((r) => r.technician === null && !isClosed(r.status)).sort(compareQueue)
}

export function activeJobs(requests: ServiceRequest[], tech: TechId): ServiceRequest[] {
  return requests.filter((r) => r.technician === tech && isActiveWork(r.status))
}

export function isFree(requests: ServiceRequest[], tech: TechId): boolean {
  return activeJobs(requests, tech).length === 0
}

/** Job a technician is working on right now: in progress before assigned, then queue order. */
export function currentJob(requests: ServiceRequest[], tech: TechId): ServiceRequest | undefined {
  return activeJobs(requests, tech).sort(
    (a, b) => Number(b.status === 'In progress') - Number(a.status === 'In progress') || compareQueue(a, b),
  )[0]
}

export function dueAt(request: ServiceRequest): number {
  return request.receivedAt + RESPONSE_TARGET[request.urgency]
}

export function isOverdue(request: ServiceRequest, now: number): boolean {
  return !isClosed(request.status) && now > dueAt(request)
}
