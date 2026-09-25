import { Box } from '@mui/material'
import { EventLog } from './EventLog'
import { RequestsTable } from './RequestsTable'
import { TechniciansPanel } from './TechniciansPanel'

export function OperatorView() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        p: 2,
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 480px' },
        height: { lg: 'calc(100vh - 64px)' },
      }}
    >
      <RequestsTable />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: { xs: 600, lg: 0 } }}>
        <TechniciansPanel />
        <EventLog />
      </Box>
    </Box>
  )
}
