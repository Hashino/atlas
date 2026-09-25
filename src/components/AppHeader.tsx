import InfoOutlined from '@mui/icons-material/InfoOutlined'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import RestartAltRounded from '@mui/icons-material/RestartAltRounded'
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { formatClock, formatDate } from '../domain/time'
import { useSimulation } from '../state/SimulationProvider'

export type Screen = 'operator' | 'technician'

export function AppHeader({ screen, onScreen }: { screen: Screen; onScreen: (screen: Screen) => void }) {
  const { state, dispatch } = useSimulation()
  const [showAssumptions, setShowAssumptions] = useState(false)

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: { xs: 1, md: 0 } }}>
        <Typography variant="h6" color="primary" sx={{ flexGrow: { xs: 1, md: 0 } }}>
          Atlas Service Desk
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            size="small"
            color="primary"
            exclusive
            value={screen}
            onChange={(_, v: Screen | null) => v && onScreen(v)}
          >
            <ToggleButton value="operator" sx={{ px: 2 }}>
              Operator
            </ToggleButton>
            <ToggleButton value="technician" sx={{ px: 2 }}>
              Technician
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ textAlign: 'right', mr: 1 }}>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.2 }}>
              {formatDate(state.now)} · simulated
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, lineHeight: 1.2 }}>
              {formatClock(state.now)}
            </Typography>
          </Box>
          <Tooltip title={state.running ? 'Pause' : 'Resume'}>
            <IconButton onClick={() => dispatch({ type: 'set-running', running: !state.running })}>
              {state.running ? <PauseRounded /> : <PlayArrowRounded />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Restart demo from 09:00">
            <IconButton onClick={() => dispatch({ type: 'reset' })}>
              <RestartAltRounded />
            </IconButton>
          </Tooltip>
          <Tooltip title="Assumptions">
            <IconButton onClick={() => setShowAssumptions(true)}>
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
      <AssumptionsDialog open={showAssumptions} onClose={() => setShowAssumptions(false)} />
    </AppBar>
  )
}

const ASSUMPTIONS = [
  'Atlas is fictional and every customer, message and event is synthetic. Email, WhatsApp and phone are simulated; nothing is actually sent.',
  'The clock starts at 09:00 on 1 October 2026 and runs in real time. A scripted 7.5-minute stream of events plays from there. Chained steps, such as the customer message after a status update, follow one second after their cause.',
  'The AI triage is simulated with keyword rules. It sets urgency (Critical, High, Normal, Low), flags vague messages, and links follow-ups to the customer’s latest open request.',
  'Response targets (not supplied by Atlas): Critical 4h, High 8h, Normal 48h, Low 7 days, counted from when the request was received.',
  'A technician is free when they have no job assigned or in progress. A job waiting for a part doesn’t keep them busy.',
  'Queue order: highest urgency first, oldest first within the same urgency. While auto-assign is on, a check runs every second and gives the head of the queue to any free technician.',
  'When the operator takes a technician off a request, auto-assign won’t give that request back to the same technician.',
  'Every assignment, status update and completion notifies the customer on the channel they used.',
]

function AssumptionsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Demo assumptions</DialogTitle>
      <DialogContent>
        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
          {ASSUMPTIONS.map((a) => (
            <Typography component="li" variant="body2" key={a} sx={{ mb: 1 }}>
              {a}
            </Typography>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
