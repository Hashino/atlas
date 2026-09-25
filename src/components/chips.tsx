import EmailOutlined from '@mui/icons-material/EmailOutlined'
import PhoneOutlined from '@mui/icons-material/PhoneOutlined'
import WhatsApp from '@mui/icons-material/WhatsApp'
import { Chip, Tooltip, type ChipProps } from '@mui/material'
import type { Channel, RequestStatus, Urgency } from '../domain/types'

const URGENCY_COLOR: Record<Urgency, ChipProps['color']> = {
  Critical: 'error',
  High: 'warning',
  Normal: 'info',
  Low: 'default',
}

const STATUS_COLOR: Record<RequestStatus, ChipProps['color']> = {
  Queued: 'default',
  Assigned: 'primary',
  'In progress': 'primary',
  'Waiting for part': 'secondary',
  Completed: 'success',
  Merged: 'default',
}

export function UrgencyChip({ urgency, reason }: { urgency: Urgency; reason?: string }) {
  const chip = <Chip size="small" label={urgency} color={URGENCY_COLOR[urgency]} />
  return reason ? <Tooltip title={reason}>{chip}</Tooltip> : chip
}

export function StatusChip({ status, label }: { status: RequestStatus; label?: string }) {
  return (
    <Chip
      size="small"
      label={label ?? status}
      color={STATUS_COLOR[status]}
      variant={status === 'In progress' || status === 'Completed' ? 'filled' : 'outlined'}
    />
  )
}

export function ChannelIcon({ channel }: { channel: Channel }) {
  const icons: Record<Channel, typeof EmailOutlined> = { Email: EmailOutlined, WhatsApp, Phone: PhoneOutlined }
  const Icon = icons[channel]
  return (
    <Tooltip title={channel}>
      <Icon fontSize="small" sx={{ color: 'text.secondary', verticalAlign: 'middle' }} />
    </Tooltip>
  )
}
