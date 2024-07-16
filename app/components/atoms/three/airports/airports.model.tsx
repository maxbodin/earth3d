import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'

interface AirportsContextValue {
   displayedAirportsGroup: Set<THREE.Mesh>;
   setDisplayedAirportsGroup: React.Dispatch<React.SetStateAction<Set<THREE.Mesh>>>
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
      useState<Set<THREE.Mesh>>(new Set<THREE.Mesh>())

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
