import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f4e79' },
    secondary: { main: '#c77700' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
  },
  components: {
    MuiPaper: { defaultProps: { variant: 'outlined' } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 600, color: '#51606f', whiteSpace: 'nowrap' } } },
  },
})
