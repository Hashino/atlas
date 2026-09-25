import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { initialState, reducer, type Action } from '../domain/simulation'
import { SECOND } from '../domain/time'
import type { SimState } from '../domain/types'

interface SimulationContextValue {
  state: SimState
  dispatch: Dispatch<Action>
}

const SimulationContext = createContext<SimulationContextValue | null>(null)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // The simulation clock: one tick per real second advances time, runs due
  // scripted events and the auto-assign check.
  useEffect(() => {
    if (!state.running) return
    const id = setInterval(() => dispatch({ type: 'tick' }), SECOND)
    return () => clearInterval(id)
  }, [state.running])

  return <SimulationContext.Provider value={{ state, dispatch }}>{children}</SimulationContext.Provider>
}

export function useSimulation(): SimulationContextValue {
  const value = useContext(SimulationContext)
  if (!value) throw new Error('useSimulation must be used inside SimulationProvider')
  return value
}
