import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { Actor, ServiceRequest, UpdateStatus } from '../domain/types'
import { useSimulation } from '../state/SimulationProvider'

interface Props {
  request: ServiceRequest | null
  by: Actor
  onClose: () => void
}

export function StatusUpdateDialog({ request, by, onClose }: Props) {
  return (
    <Dialog open={request !== null} onClose={onClose} fullWidth maxWidth="sm">
      {request && <StatusUpdateForm key={request.id} request={request} by={by} onDone={onClose} />}
    </Dialog>
  )
}

function StatusUpdateForm({ request, by, onDone }: { request: ServiceRequest; by: Actor; onDone: () => void }) {
  const { dispatch } = useSimulation()
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<UpdateStatus | ''>('')

  const post = () => {
    dispatch({ type: 'status-update', requestId: request.id, note: note.trim(), status: status || undefined, by })
    onDone()
  }
  const complete = () => {
    dispatch({ type: 'complete', requestId: request.id, note: note.trim() || 'Job completed.', by })
    onDone()
  }

  return (
    <>
      <DialogTitle>Status update · {request.id}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {request.customer} via {request.channel}: “{request.message}”. The customer gets this update on{' '}
            {request.channel}.
          </Typography>
          <TextField
            label="Update for the customer"
            multiline
            minRows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as UpdateStatus | '')}
          >
            <MenuItem value="">Keep current ({request.status})</MenuItem>
            <MenuItem value="In progress">In progress</MenuItem>
            <MenuItem value="Waiting for part">Waiting for part</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDone}>Cancel</Button>
        <Button color="success" onClick={complete}>
          Mark complete
        </Button>
        <Button variant="contained" onClick={post} disabled={!note.trim()}>
          Post update
        </Button>
      </DialogActions>
    </>
  )
}
