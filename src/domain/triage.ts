import type { Urgency } from './types'

/**
 * Simulated AI triage. A real deployment would call an LLM; the demo uses keyword
 * rules so the output is deterministic and explainable in the event log.
 */
export interface Triage {
  urgency: Urgency
  reason: string
  needsInfo: boolean
  /** The message chases an existing request rather than reporting a new fault. */
  followUp: boolean
  /** The customer says the problem is gone. */
  resolved: boolean
}

const CRITICAL: [RegExp, string][] = [
  [/\bgas\b/i, 'possible gas leak'],
  [/smoke|fire/i, 'fire risk'],
  [/flood/i, 'flooding'],
  [/stored goods|spoil/i, 'risk to stored goods'],
  [/temperature (is )?rising/i, 'temperature rising'],
]

const HIGH: [RegExp, string][] = [
  [/not working|stopp(ed|ing)|broken|down\b/i, 'equipment not operating'],
  [/pressure/i, 'pressure warning'],
  [/leak/i, 'leak reported'],
  [/alarm|warning|fault|error/i, 'alarm or fault code'],
  [/\btoday\b|urgent|asap/i, 'customer asks for same-day visit'],
]

const LOW: [RegExp, string][] = [
  [/routine|inspection|annual|service is due/i, 'planned maintenance'],
  [/next (week|month)|schedule/i, 'no immediate deadline'],
]

const FOLLOW_UP = /follow(ing)? up|any update|still waiting|confirm when|waiting for .*update/i
const RESOLVED = /running again|working again|resolved|fixed now/i
const EQUIPMENT =
  /cold-room|cold room|pump|unit|freezer|boiler|compressor|conveyor|chiller|cooler|ice machine|fan|motor|valve/i

function matches(rules: [RegExp, string][], message: string): string[] {
  return rules.filter(([re]) => re.test(message)).map(([, label]) => label)
}

export function triage(message: string): Triage {
  const followUp = FOLLOW_UP.test(message)
  const resolved = RESOLVED.test(message)

  const critical = matches(CRITICAL, message)
  const high = matches(HIGH, message)
  const low = matches(LOW, message)

  let urgency: Urgency
  let signals: string[]
  if (critical.length) [urgency, signals] = ['Critical', critical]
  else if (high.length) [urgency, signals] = ['High', high]
  else if (low.length) [urgency, signals] = ['Low', low]
  else [urgency, signals] = ['Normal', []]

  if (resolved) {
    urgency = 'Normal'
    signals = ['customer reports the issue is resolved']
  } else if (followUp && !critical.length && !high.length) {
    signals = ['follow-up on an existing job']
  }

  const needsInfo = urgency !== 'Low' && !resolved && !followUp && !EQUIPMENT.test(message)

  const reason = signals.length ? signals.join(', ') : 'no risk signals found'
  return { urgency, reason, needsInfo, followUp, resolved }
}
