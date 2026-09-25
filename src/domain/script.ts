import type { Channel, TechId, UpdateStatus } from './types'

/**
 * Scripted demo timeline, in seconds after 09:00:00. Every feature appears within
 * the first three minutes; the rest keeps the demo alive up to 09:07:30.
 *
 * Technician events act on the technician's current job unless they name a request.
 * They're skipped when that job no longer belongs to the technician, so operator
 * actions during the demo never break the script.
 */
export type ScriptEvent = { at: number } & (
  | { kind: 'ingest'; channel: Channel; customer: string; message: string }
  | { kind: 'tech-update'; tech: TechId; requestId?: string; note: string; status?: UpdateStatus }
  | { kind: 'tech-complete'; tech: TechId; requestId?: string; note: string }
  | { kind: 'system'; text: string }
)

export const SCRIPT: ScriptEvent[] = [
  { at: 9, kind: 'tech-update', tech: 'T2', requestId: 'R101', note: 'Heading to the C01 cold room, ETA 09:40.' },
  {
    at: 18,
    kind: 'ingest',
    channel: 'WhatsApp',
    customer: 'C08',
    message: 'Freezer alarm is going off and the temperature is rising in the display case.',
  },
  { at: 30, kind: 'tech-complete', tech: 'T3', note: 'Customer confirmed the unit is running again. Closing the job.' },
  { at: 45, kind: 'ingest', channel: 'Email', customer: 'C02', message: 'Any update on the pump? We are still waiting.' },
  { at: 57, kind: 'tech-update', tech: 'T3', note: 'On site at C08, checking the freezer compressor.' },
  { at: 68, kind: 'tech-update', tech: 'T1', note: 'Pump impeller replaced, running tests now.' },
  {
    at: 78,
    kind: 'ingest',
    channel: 'Phone',
    customer: 'C09',
    message: 'Annual boiler service is due next month, please schedule a visit.',
  },
  { at: 90, kind: 'tech-complete', tech: 'T1', note: 'Pump tested and running normally.' },
  {
    at: 105,
    kind: 'tech-update',
    tech: 'T1',
    note: 'Called C04: packaging line conveyor motor, fault code E-204. Bringing a spare drive.',
  },
  {
    at: 117,
    kind: 'ingest',
    channel: 'WhatsApp',
    customer: 'C10',
    message: 'Compressor on chiller 2 is making a loud noise but still running.',
  },
  {
    at: 132,
    kind: 'tech-update',
    tech: 'T2',
    requestId: 'R106',
    note: 'Replacement part arrived, installing now.',
    status: 'In progress',
  },
  {
    at: 144,
    kind: 'tech-update',
    tech: 'T3',
    note: 'Door seal failed on the display freezer. Temporary fix applied, temperature recovering.',
  },
  { at: 158, kind: 'tech-complete', tech: 'T2', requestId: 'R101', note: 'Cold-room fan motor replaced, unit holding temperature.' },
  { at: 173, kind: 'tech-complete', tech: 'T2', requestId: 'R106', note: 'Part installed and tested.' },
  { at: 192, kind: 'ingest', channel: 'Email', customer: 'C07', message: 'Following up: the pressure warning is still showing.' },
  {
    at: 210,
    kind: 'ingest',
    channel: 'Phone',
    customer: 'C11',
    message: 'Strong gas smell near the boiler room, please send someone urgently.',
  },
  { at: 225, kind: 'tech-update', tech: 'T2', note: 'Pressure sensor reading high on the C07 compressor, checking the relief valve.' },
  { at: 248, kind: 'tech-complete', tech: 'T3', note: 'Freezer door seal replaced, temperature back to normal.' },
  { at: 263, kind: 'tech-update', tech: 'T3', note: 'On site at C11. Gas supply isolated and area ventilated.' },
  { at: 285, kind: 'ingest', channel: 'WhatsApp', customer: 'C12', message: 'Ice machine is leaking water onto the kitchen floor.' },
  { at: 308, kind: 'tech-update', tech: 'T1', note: 'Drive replaced on the C04 conveyor, running a load test.' },
  { at: 330, kind: 'tech-complete', tech: 'T1', note: 'Conveyor back in operation.' },
  { at: 353, kind: 'tech-update', tech: 'T1', note: 'Inlet valve cracked on the ice machine, replacing it.' },
  { at: 375, kind: 'tech-complete', tech: 'T2', note: 'Relief valve replaced, pressure back within range.' },
  { at: 393, kind: 'tech-update', tech: 'T3', note: 'Gas leak traced to a loose fitting, repaired and pressure-tested.' },
  { at: 413, kind: 'tech-complete', tech: 'T3', note: 'Gas supply restored and verified safe.' },
  {
    at: 428,
    kind: 'tech-update',
    tech: 'T2',
    note: 'Chiller 2 compressor bearing is worn. Replacement part ordered.',
    status: 'Waiting for part',
  },
  { at: 443, kind: 'tech-complete', tech: 'T1', note: 'Ice machine repaired, floor dry.' },
  { at: 450, kind: 'system', text: 'Scripted demo events finished. The simulation keeps running.' },
]
