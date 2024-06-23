'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ScenesContextValue {
   globeScene: THREE.Scene
   setGlobeScene: React.Dispatch<React.SetStateAction<THREE.Scene>>
   planeScene: THREE.Scene
   setPlaneScene: React.Dispatch<React.SetStateAction<THREE.Scene>>
   displayedSceneData: {
      type: SceneType
      camera: THREE.PerspectiveCamera
      controls: OrbitControls
      scene: THREE.Scene
   }
   setDisplayedSceneData: React.Dispatch<React.SetStateAction<{
      type: SceneType
      camera: THREE.PerspectiveCamera
      controls: OrbitControls
      scene: THREE.Scene
   }>>
}

const ScenesContext = createContext<ScenesContextValue | null>(null)

export function useScenes(): ScenesContextValue {
   const context = useContext(ScenesContext)
   if (!context) {
      throw new Error('useScenes must be used within a PlanetProvider')
   }
   return context
}

export function ScenesProvider({ children }: { children: ReactNode }) {
   const [globeScene, setGlobeScene] = useState<THREE.Scene>(new THREE.Scene())
   const [planeScene, setPlaneScene] = useState<THREE.Scene>(new THREE.Scene())
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
