import { useState } from 'react'
import { AppHeader, type Screen } from './components/AppHeader'
import { OperatorView } from './components/OperatorView'
import { TechnicianView } from './components/TechnicianView'

export default function App() {
  const [screen, setScreen] = useState<Screen>('operator')
  return (
    <>
      <AppHeader screen={screen} onScreen={setScreen} />
      {screen === 'operator' ? <OperatorView /> : <TechnicianView />}
    </>
  )
}
