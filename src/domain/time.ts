/** Simulation start: 09:00, 1 October 2026, Atlas local time (see INTRO.md). */
export const SIM_START = new Date(2026, 9, 1, 9, 0, 0).getTime()

export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE

/** Builds a timestamp relative to the simulation's calendar (month is 1-based). */
export function at(month: number, day: number, hour: number, minute: number, second = 0): number {
  return new Date(2026, month - 1, day, hour, minute, second).getTime()
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatReceived(ms: number): string {
  const d = new Date(ms)
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time}`
}

export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / MINUTE))
  const days = Math.floor(minutes / (24 * 60))
  const hours = Math.floor((minutes % (24 * 60)) / 60)
  const mins = minutes % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}
