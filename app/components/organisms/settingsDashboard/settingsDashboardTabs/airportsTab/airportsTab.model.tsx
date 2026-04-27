import React, { createContext, ReactNode, useContext } from 'react'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'

interface AirportsTabContextValue {
   airportsActivated: boolean
   setAirportsActivated: React.Dispatch<React.SetStateAction<boolean>>
}

const AirportsTabContext = createContext<AirportsTabContextValue | null>(null)

export function useAirportsTab(): AirportsTabContextValue {
   const context = useContext(AirportsTabContext)
   if (!context) {
      throw new Error(
         'useAirportsTab must be used within a AirportsTabProvider',
      )
   }
   return context
}

export function AirportsTabProvider({ children }: { children: ReactNode }) {
   const [airportsActivated, setAirportsActivated] = useLocalStorageState<boolean>('settings.airports.activated', true)

   const value: AirportsTabContextValue = {
      airportsActivated: airportsActivated,
      setAirportsActivated: setAirportsActivated,
   }

   return (
      <AirportsTabContext.Provider value={value}>
         {children}
      </AirportsTabContext.Provider>
   )
}
