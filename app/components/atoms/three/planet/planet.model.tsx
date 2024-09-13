import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'

interface PlanetContextValue {
   planet: THREE.Mesh | null
   setPlanet: React.Dispatch<React.SetStateAction<THREE.Mesh | null>>
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
   const [planet, setPlanet] = useState<THREE.Mesh | null>(null)

   const value: PlanetContextValue = {
      planet: planet,
      setPlanet: setPlanet,
   }

   return (
      <PlanetContext.Provider value={value}>
         {children}
      </PlanetContext.Provider>
   )
}