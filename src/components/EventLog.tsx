import { Box, Chip, Paper, Stack, Typography, type ChipProps } from '@mui/material'
import { formatClock } from '../domain/time'
import type { LogKind } from '../domain/types'
import { useSimulation } from '../state/SimulationProvider'

const KIND: Record<LogKind, { label: string; color: ChipProps['color'] }> = {
  ingest: { label: 'Inbound', color: 'primary' },
  ai: { label: 'AI triage', color: 'secondary' },
  assign: { label: 'Auto-assign', color: 'success' },
  tech: { label: 'Technician', color: 'info' },
  notify: { label: 'To customer', color: 'default' },
  operator: { label: 'Operator', color: 'warning' },
  system: { label: 'System', color: 'default' },
}

export function EventLog() {
  const { state } = useSimulation()
  const entries = [...state.log].reverse()

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <Typography variant="h6" sx={{ px: 2, py: 1.5 }}>
        Event log
      </Typography>
      <Box sx={{ overflowY: 'auto', flex: 1, px: 2, pb: 1 }}>
        {entries.map((e) => (
          <Stack
            key={e.id}
            direction="row"
            spacing={1}
            sx={{
              py: 0.75,
              borderTop: 1,
              borderColor: 'divider',
              alignItems: 'flex-start',
              animation: 'log-in 600ms ease-out',
              '@keyframes log-in': { from: { backgroundColor: 'rgba(31, 78, 121, 0.12)' }, to: {} },
            }}
          >
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', pt: 0.25 }}>
              {formatClock(e.at)}
            </Typography>
            <Chip
              size="small"
              label={KIND[e.kind].label}
              color={KIND[e.kind].color}
              variant={e.kind === 'notify' || e.kind === 'system' ? 'outlined' : 'filled'}
              sx={{ minWidth: 92, flexShrink: 0 }}
            />
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {e.text}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Paper>
  )
}
