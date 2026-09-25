import {
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { compareQueue, isActiveWork, isClosed, isFree } from '../domain/queue'
import { formatClock } from '../domain/time'
import { TECHNICIANS, type ServiceRequest, type TechId } from '../domain/types'
import { useSimulation } from '../state/SimulationProvider'

export function TechniciansPanel() {
  const { state, dispatch } = useSimulation()

  return (
    <Paper>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <Typography variant="h6">Technicians</Typography>
        <FormControlLabel
          control={<Switch checked={state.autoAssign} onChange={() => dispatch({ type: 'toggle-auto-assign' })} />}
          label="Auto-assign from queue"
          labelPlacement="start"
        />
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tech</TableCell>
              <TableCell>Current job</TableCell>
              <TableCell>Last update</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {TECHNICIANS.map((tech) => {
              const jobs = openJobs(state.requests, tech)
              const free = isFree(state.requests, tech)
              // One row per open job, plus a "Free" row when none of them keeps the technician busy.
              const rows: (ServiceRequest | null)[] = free ? [null, ...jobs] : jobs
              return rows.map((job, i) => {
                const last = job?.updates.at(-1)
                return (
                  <TableRow key={`${tech}-${job?.id ?? 'free'}`}>
                    {i === 0 && (
                      <TableCell rowSpan={rows.length} sx={{ fontWeight: 600, verticalAlign: 'top' }}>
                        {tech}
                      </TableCell>
                    )}
                    <TableCell sx={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      {job ? `${job.id} · ${job.status}` : <Chip size="small" label="Free" color="success" />}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      {last ? (
                        <>
                          <Typography variant="body2">{last.note}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatClock(last.at)}
                          </Typography>
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!state.autoAssign && (
        <Typography variant="caption" color="text.secondary" component="p" sx={{ px: 2, py: 1 }}>
          Auto-assign is off. Assign technicians from the requests table.
        </Typography>
      )}
    </Paper>
  )
}

/** Open jobs, the ones keeping the technician busy first (in progress before assigned), then parked ones. */
function openJobs(requests: ServiceRequest[], tech: TechId): ServiceRequest[] {
  const rank = (r: ServiceRequest) => (r.status === 'In progress' ? 0 : isActiveWork(r.status) ? 1 : 2)
  return requests
    .filter((r) => r.technician === tech && !isClosed(r.status))
    .sort((a, b) => rank(a) - rank(b) || compareQueue(a, b))
}
