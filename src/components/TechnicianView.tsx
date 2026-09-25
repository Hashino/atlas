import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { compareQueue, isFree } from '../domain/queue'
import { formatClock, formatReceived } from '../domain/time'
import { TECHNICIANS, type ServiceRequest, type TechId, type UpdateStatus } from '../domain/types'
import { useSimulation } from '../state/SimulationProvider'
import { ChannelIcon, StatusChip, UrgencyChip } from './chips'

export function TechnicianView() {
  const { state } = useSimulation()
  const [tech, setTech] = useState<TechId>('T1')

  const mine = state.requests.filter((r) => r.technician === tech)
  const open = mine
    .filter((r) => r.status === 'Assigned' || r.status === 'In progress' || r.status === 'Waiting for part')
    .sort(compareQueue)
  const done = mine.filter((r) => r.status === 'Completed').sort((a, b) => (b.closedAt ?? 0) - (a.closedAt ?? 0))
  const free = isFree(state.requests, tech)

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <Typography variant="h6">Signed in as</Typography>
        <ToggleButtonGroup size="small" exclusive value={tech} onChange={(_, v: TechId | null) => v && setTech(v)}>
          {TECHNICIANS.map((t) => (
            <ToggleButton key={t} value={t} sx={{ px: 2 }}>
              {t}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Chip label={free ? 'Free' : 'Busy'} color={free ? 'success' : 'default'} />
      </Stack>

      {free && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {state.autoAssign
            ? 'You have no active job. The next job in the queue will be assigned to you automatically.'
            : 'You have no active job. Auto-assign is off, so the coordinator will assign your next job.'}
        </Typography>
      )}

      <Stack spacing={2}>
        {open.map((r) => (
          <JobCard key={r.id} request={r} tech={tech} />
        ))}
      </Stack>

      {done.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Completed today
          </Typography>
          {done.map((r) => (
            <Typography key={r.id} variant="body2" color="text.secondary">
              {formatClock(r.closedAt!)} · {r.id} ({r.customer}): {r.updates.at(-1)?.note}
            </Typography>
          ))}
        </>
      )}
    </Box>
  )
}

function JobCard({ request: r, tech }: { request: ServiceRequest; tech: TechId }) {
  const { dispatch } = useSimulation()
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<UpdateStatus | ''>('')

  const post = () => {
    dispatch({ type: 'status-update', requestId: r.id, note: note.trim(), status: status || undefined, by: tech })
    setNote('')
    setStatus('')
  }
  const complete = () => {
    dispatch({ type: 'complete', requestId: r.id, note: note.trim() || 'Job completed.', by: tech })
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap', rowGap: 1 }}>
          <ChannelIcon channel={r.channel} />
          <Typography variant="h6">{r.id}</Typography>
          <UrgencyChip urgency={r.urgency} reason={r.urgencyReason} />
          <StatusChip status={r.status} />
          {r.needsInfo && <Chip size="small" variant="outlined" color="warning" label="Call customer for details" />}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {r.customer} · received {formatReceived(r.receivedAt)} via {r.channel}
        </Typography>
        <Typography sx={{ my: 1 }}>“{r.message}”</Typography>
        {r.updates.map((u, i) => (
          <Typography key={i} variant="body2" color="text.secondary">
            {formatClock(u.at)} · {u.by === 'operator' ? 'Coordinator' : u.by}: {u.note}
          </Typography>
        ))}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          <TextField
            size="small"
            fullWidth
            label={`Update (sent to ${r.customer} via ${r.channel})`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && note.trim() && post()}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as UpdateStatus | '')}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Keep current</MenuItem>
            <MenuItem value="In progress">In progress</MenuItem>
            <MenuItem value="Waiting for part">Waiting for part</MenuItem>
          </TextField>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Button variant="outlined" onClick={post} disabled={!note.trim()}>
          Post update
        </Button>
        <Button variant="contained" color="success" onClick={complete}>
          Mark complete
        </Button>
      </CardActions>
    </Card>
  )
}
