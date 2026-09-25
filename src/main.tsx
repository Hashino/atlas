import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/600.css'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SimulationProvider } from './state/SimulationProvider'
import { theme } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SimulationProvider>
        <App />
      </SimulationProvider>
    </ThemeProvider>
  </StrictMode>,
)
