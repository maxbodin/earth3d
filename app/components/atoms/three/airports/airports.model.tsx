import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'

interface AirportsContextValue {
   displayedAirportsGroup: THREE.Group
   setDisplayedAirportsGroup: React.Dispatch<React.SetStateAction<THREE.Group>>
}

const AirportsContext = createContext<AirportsContextValue | null>(null)

export function useAirports(): AirportsContextValue {
   const context = useContext(AirportsContext)
   if (!context) {
      throw new Error('useAirports must be used within a AirportsProvider')
   }
   return context
}

export function AirportsProvider({ children }: { children: ReactNode }) {
   const [displayedAirportsGroup, setDisplayedAirportsGroup] =
      useState<THREE.Group>(new THREE.Group())

   const value: AirportsContextValue = {
      displayedAirportsGroup: displayedAirportsGroup,
      setDisplayedAirportsGroup: setDisplayedAirportsGroup,
   }

   return (
      <AirportsContext.Provider value={value}>
         {children}
      </AirportsContext.Provider>
   )
}
