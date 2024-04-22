'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'
import { SceneType } from '@/app/components/enums/sceneType'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ScenesContextValue {
   globeScene: THREE.Scene
   setGlobeScene: React.Dispatch<React.SetStateAction<any>>
   planeScene: THREE.Scene
   setPlaneScene: React.Dispatch<React.SetStateAction<any>>
   displayedSceneData: {
      type: SceneType
      camera: THREE.PerspectiveCamera
      controls: OrbitControls
      scene: THREE.Scene
   }
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
      globeScene: globeScene,
      setGlobeScene: setGlobeScene,
      planeScene: planeScene,
      setPlaneScene: setPlaneScene,
      displayedSceneData: displayedSceneData,
      setDisplayedSceneData: setDisplayedSceneData,
   }

   return (
      <ScenesContext.Provider value={value}>{children}</ScenesContext.Provider>
   )
}
