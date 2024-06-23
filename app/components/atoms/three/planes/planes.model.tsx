import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'

interface PlanesContextValue {
   displayedPlanesGroup: THREE.Group
   setDisplayedPlanesGroup: React.Dispatch<React.SetStateAction<any>>
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
   const [displayedPlanesGroup, setDisplayedPlanesGroup] =
      useState<THREE.Group>(new THREE.Group())

   const value: PlanesContextValue = {
      displayedPlanesGroup: displayedPlanesGroup,
      setDisplayedPlanesGroup: setDisplayedPlanesGroup,
   }

   return (
      <PlanesContext.Provider value={value}>
         {children}
      </PlanesContext.Provider>
   )
}
