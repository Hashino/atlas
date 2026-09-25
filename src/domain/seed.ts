import { at } from './time'
import type { Channel, RequestStatus, TechId } from './types'

export interface SeedRow {
  id: string
  receivedAt: number
  channel: Channel
  customer: string
  message: string
  status: RequestStatus
  technician: TechId | null
}

/** The coordinator's spreadsheet at 09:00, as given in INTRO.md. */
export const SEED: SeedRow[] = [
  {
    id: 'R101',
    receivedAt: at(9, 30, 16, 10),
    channel: 'Email',
    customer: 'C01',
    message: 'Cold-room unit keeps stopping. Stored goods could be affected.',
    status: 'Queued',
    technician: null,
  },
  {
    id: 'R102',
    receivedAt: at(10, 1, 8, 20),
    channel: 'WhatsApp',
    customer: 'C02',
    message: "Can you confirm when someone is coming for yesterday's pump request?",
    status: 'Assigned',
    technician: 'T1',
  },
  {
    id: 'R103',
    receivedAt: at(9, 30, 11, 0),
    channel: 'Phone',
    customer: 'C03',
    message: 'Routine inspection request for next week.',
    status: 'Queued',
    technician: null,
  },
  {
    id: 'R104',
    receivedAt: at(10, 1, 8, 25),
    channel: 'Email',
    customer: 'C01',
    message: 'Following up on the cold-room fault reported yesterday.',
    status: 'Queued',
    technician: null,
  },
  {
    id: 'R105',
    receivedAt: at(10, 1, 8, 30),
    channel: 'Phone',
    customer: 'C04',
    message: 'Machine not working. Please call us.',
    status: 'Queued',
    technician: null,
  },
  {
    id: 'R106',
    receivedAt: at(9, 29, 14, 0),
    channel: 'Email',
    customer: 'C05',
    message: 'We are waiting for the replacement part and an update.',
    status: 'Waiting for part',
    technician: 'T2',
  },
  {
    id: 'R107',
    receivedAt: at(9, 30, 15, 0),
    channel: 'WhatsApp',
    customer: 'C06',
    message: 'Thanks, the unit is running again.',
    status: 'In progress',
    technician: 'T3',
  },
  {
    id: 'R108',
    receivedAt: at(10, 1, 8, 40),
    channel: 'Email',
    customer: 'C07',
    message: 'Please send someone today for a pressure warning.',
    status: 'Queued',
    technician: null,
  },
]
