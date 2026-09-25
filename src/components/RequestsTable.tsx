import RateReviewOutlined from '@mui/icons-material/RateReviewOutlined'
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { compareQueue, dueAt, isClosed, isOverdue, queue } from '../domain/queue'
import { formatDuration, formatReceived } from '../domain/time'
import { TECHNICIANS, URGENCIES, type ServiceRequest, type TechId, type Urgency } from '../domain/types'
import { useSimulation } from '../state/SimulationProvider'
import { ChannelIcon, StatusChip, UrgencyChip } from './chips'
import { StatusUpdateDialog } from './StatusUpdateDialog'

type Filter = 'open' | 'all'

export function RequestsTable() {
  const { state, dispatch } = useSimulation()
  const [filter, setFilter] = useState<Filter>('open')
  const [editing, setEditing] = useState<string | null>(null)

  const queuePosition = new Map(queue(state.requests).map((r, i) => [r.id, i + 1]))
  const open = state.requests.filter((r) => !isClosed(r.status)).sort(compareQueue)
  const closed = state.requests.filter((r) => isClosed(r.status)).sort((a, b) => (b.closedAt ?? 0) - (a.closedAt ?? 0))
  const rows = filter === 'open' ? open : [...open, ...closed]

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <Typography variant="h6">Requests</Typography>
        <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, v: Filter | null) => v && setFilter(v)}>
          <ToggleButton value="open">Open ({open.length})</ToggleButton>
          <ToggleButton value="all">All ({state.requests.length})</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <TableContainer sx={{ flex: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Request</TableCell>
              <TableCell>Customer message</TableCell>
              <TableCell>Waiting</TableCell>
              <TableCell>Urgency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                now={state.now}
                queuePosition={queuePosition.get(r.id)}
                onUrgency={(urgency) => dispatch({ type: 'set-urgency', requestId: r.id, urgency })}
                onAssign={(tech) => dispatch({ type: 'assign', requestId: r.id, tech })}
                onUpdate={() => setEditing(r.id)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <StatusUpdateDialog
        request={state.requests.find((r) => r.id === editing) ?? null}
        by="operator"
        onClose={() => setEditing(null)}
      />
    </Paper>
  )
}

interface RowProps {
  request: ServiceRequest
  now: number
  queuePosition?: number
  onUrgency: (urgency: Urgency) => void
  onAssign: (tech: TechId | null) => void
  onUpdate: () => void
}

function RequestRow({ request: r, now, queuePosition, onUrgency, onAssign, onUpdate }: RowProps) {
  const closed = isClosed(r.status)
  const overdue = isOverdue(r, now)
  const lastUpdate = r.updates.at(-1)

  return (
    <TableRow hover sx={{ opacity: closed ? 0.55 : 1, verticalAlign: 'top' }}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <ChannelIcon channel={r.channel} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {r.id}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {r.customer} · {formatReceived(r.receivedAt)}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 220 }}>
        <Typography variant="body2">{r.message}</Typography>
        {lastUpdate && (
          <Typography variant="caption" color="text.secondary" component="div">
            Latest: {lastUpdate.note}
          </Typography>
        )}
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}>
          {r.needsInfo && <Chip size="small" variant="outlined" color="warning" label="Needs details: call back" />}
          {r.hint && <Chip size="small" variant="outlined" color="success" label={r.hint} />}
          {r.duplicateOf && <Chip size="small" variant="outlined" label={`Duplicate of ${r.duplicateOf}`} />}
        </Stack>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{formatDuration((r.closedAt ?? now) - r.receivedAt)}</Typography>
        {overdue ? (
          <Chip size="small" color="error" label={`Overdue ${formatDuration(now - dueAt(r))}`} sx={{ mt: 0.5 }} />
        ) : (
          !closed && (
            <Typography variant="caption" color="text.secondary">
              due in {formatDuration(dueAt(r) - now)}
            </Typography>
          )
        )}
      </TableCell>
      <TableCell>
        <Tooltip title={`${r.urgencySource === 'ai' ? 'AI triage' : 'Operator'}: ${r.urgencyReason}`} placement="left">
          <Select
            size="small"
            variant="standard"
            disableUnderline
            value={r.urgency}
            disabled={closed}
            onChange={(e) => onUrgency(e.target.value as Urgency)}
            renderValue={(u) => <UrgencyChip urgency={u} />}
          >
            {URGENCIES.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>
        {r.urgencySource === 'ai' && !closed && (
          <Typography variant="caption" color="text.secondary" component="div">
            AI triage
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <StatusChip status={r.status} label={queuePosition ? `Queued #${queuePosition}` : undefined} />
      </TableCell>
      <TableCell>
        <Select
          size="small"
          value={r.technician ?? ''}
          disabled={closed}
          displayEmpty
          onChange={(e) => onAssign((e.target.value || null) as TechId | null)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">
            <Box component="span" sx={{ color: 'text.secondary' }}>
              Unassigned
            </Box>
          </MenuItem>
          {TECHNICIANS.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </TableCell>
      <TableCell>
        <Tooltip title="Post a status update">
          <span>
            <IconButton size="small" onClick={onUpdate} disabled={closed}>
              <RateReviewOutlined fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
