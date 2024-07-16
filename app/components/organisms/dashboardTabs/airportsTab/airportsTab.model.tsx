import React, { createContext, ReactNode, useContext, useState } from 'react'

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
   const [airportsActivated, setAirportsActivated] = useState<boolean>(true)

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
