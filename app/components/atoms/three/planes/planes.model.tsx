import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { OpenSkyTrackWaypoint } from '@/app/types/openSky/openSkyTrackWaypoint'

interface PlanesContextValue {
   displayedPlanesGroup: THREE.Group
   planesData: OpenSkyStateVector[]
   setPlanesData: React.Dispatch<React.SetStateAction<OpenSkyStateVector[]>>
   openSkyRemainingTokens: number | null
   setOpenSkyRemainingTokens: React.Dispatch<React.SetStateAction<number | null>>
   planeTrackData: OpenSkyTrackWaypoint[]
   setPlaneTrackData: React.Dispatch<React.SetStateAction<OpenSkyTrackWaypoint[]>>
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
   const [planesData, setPlanesData] = useState<OpenSkyStateVector[]>([])
   const [openSkyRemainingTokens, setOpenSkyRemainingTokens] = useState<number | null>(null)
   const [planeTrackData, setPlaneTrackData] = useState<OpenSkyTrackWaypoint[]>([])

   const value: PlanesContextValue = useMemo(
      () => ({
         displayedPlanesGroup: displayedPlanesGroupRef.current,
         planesData,
         setPlanesData,
         openSkyRemainingTokens,
         setOpenSkyRemainingTokens,
         planeTrackData,
         setPlaneTrackData,
      }),
      [
         openSkyRemainingTokens,
         planeTrackData,
         planesData,
         setOpenSkyRemainingTokens,
         setPlaneTrackData,
         setPlanesData,],
   )

   return (
      <PlanesContext.Provider value={value}>
         {children}
      </PlanesContext.Provider>
   )
}
