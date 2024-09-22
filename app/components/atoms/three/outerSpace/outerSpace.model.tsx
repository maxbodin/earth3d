import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'

interface OuterSpaceContextValue {
   milkyWay: THREE.Mesh | null
   setMilkyWay: React.Dispatch<React.SetStateAction<THREE.Mesh | null>>
   hyptic: THREE.Mesh | null
   setHyptic: React.Dispatch<React.SetStateAction<THREE.Mesh | null>>
   constellationFigures: THREE.Mesh | null
   setConstellationFigures: React.Dispatch<React.SetStateAction<THREE.Mesh | null>>
   constellationBounds: THREE.Mesh | null
   setConstellationBounds: React.Dispatch<React.SetStateAction<THREE.Mesh | null>>
}

const OuterSpaceContext = createContext<OuterSpaceContextValue | null>(null)

export function useOuterSpace(): OuterSpaceContextValue {
   const context = useContext(OuterSpaceContext)
   if (!context) {
      throw new Error('useOuterSpace must be used within a OuterSpaceProvider')
   }
   return context
}

export function OuterSpaceProvider({ children }: { children: ReactNode }) {
   const [milkyWay, setMilkyWay] = useState<THREE.Mesh | null>(null)
   const [hyptic, setHyptic] = useState<THREE.Mesh | null>(null)
   const [constellationFigures, setConstellationFigures] = useState<THREE.Mesh | null>(null)
   const [constellationBounds, setConstellationBounds] = useState<THREE.Mesh | null>(null)

   const value: OuterSpaceContextValue = {
      milkyWay: milkyWay,
      setMilkyWay: setMilkyWay,
      hyptic: hyptic,
      setHyptic: setHyptic,
      constellationFigures: constellationFigures,
      setConstellationFigures: setConstellationFigures,
      constellationBounds: constellationBounds,
      setConstellationBounds: setConstellationBounds,
   }

   return (
      <OuterSpaceContext.Provider value={value}>
         {children}
      </OuterSpaceContext.Provider>
   )
}