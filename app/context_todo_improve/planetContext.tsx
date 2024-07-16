import React, { createContext, ReactNode, useContext, useState } from 'react'

interface PlanetContextValue {
   planet: any
   setPlanet: React.Dispatch<React.SetStateAction<any>>
}

const PlanetContext = createContext<PlanetContextValue | null>(null)

export function usePlanet(): PlanetContextValue {
   const context = useContext(PlanetContext)
   if (!context) {
      throw new Error('usePlanet must be used within a PlanetProvider')
   }
   return context
}

export function PlanetProvider({ children }: { children: ReactNode }) {
   const [planet, setPlanet] = useState<any>(null)

   const value: PlanetContextValue = {
      planet,
      setPlanet,
   }

   return (
      <PlanetContext.Provider value={value}>{children}</PlanetContext.Provider>
   )
}
