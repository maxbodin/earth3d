import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'

interface ScenesContextValue {
   globeScene: THREE.Scene
   setGlobeScene: React.Dispatch<React.SetStateAction<any>>
   planeScene: THREE.Scene
   setPlaneScene: React.Dispatch<React.SetStateAction<any>>
   displayedSceneData: any
   setDisplayedSceneData: React.Dispatch<React.SetStateAction<any>>
}

// Create context.
const ScenesContext = createContext<ScenesContextValue | null>(null)

// Custom hook to access context.
export function useScenes(): ScenesContextValue {
   const context = useContext(ScenesContext)
   if (!context) {
      throw new Error('useScenes must be used within a PlanetProvider')
   }
   return context
}

// Provider component.
export function ScenesProvider({ children }: { children: ReactNode }) {
   const [globeScene, setGlobeScene] = useState<any>(new THREE.Scene())
   const [planeScene, setPlaneScene] = useState<any>(new THREE.Scene())
   const [displayedSceneData, setDisplayedSceneData] = useState<any>(null)

   const value: ScenesContextValue = {
      globeScene,
      setGlobeScene,
      planeScene,
      setPlaneScene,
      displayedSceneData,
      setDisplayedSceneData,
   }

   return (
      <ScenesContext.Provider value={value}>{children}</ScenesContext.Provider>
   )
}
