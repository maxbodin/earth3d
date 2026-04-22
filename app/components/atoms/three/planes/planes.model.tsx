import React, { createContext, ReactNode, useContext, useMemo, useRef } from 'react'
import * as THREE from 'three'

interface PlanesContextValue {
   displayedPlanesGroup: THREE.Group
}

const PlanesContext = createContext<PlanesContextValue | null>(null)

export function usePlanes(): PlanesContextValue {
   const context = useContext(PlanesContext)
   if (!context) {
      throw new Error('usePlanes must be used within a PlanesProvider')
   }
   return context
}

export function PlanesProvider({ children }: { children: ReactNode }) {
   const displayedPlanesGroupRef = useRef<THREE.Group>(new THREE.Group())

   const value: PlanesContextValue = useMemo(
      () => ({
         displayedPlanesGroup: displayedPlanesGroupRef.current,
      }),
      [],
   )

   return (
      <PlanesContext.Provider value={value}>
         {children}
      </PlanesContext.Provider>
   )
}
