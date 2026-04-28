import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'

interface EarthquakesContextValue {
   displayedEarthquakesGroup: THREE.Group
   earthquakeData: UsgsEarthquakeFeature[]
   setEarthquakeData: React.Dispatch<React.SetStateAction<UsgsEarthquakeFeature[]>>
   selectedEarthquake: UsgsEarthquakeFeature | null
   setSelectedEarthquake: React.Dispatch<React.SetStateAction<UsgsEarthquakeFeature | null>>
   /** Current playback timestamp for time-lapse mode (epoch ms). null = show all. */
   playbackTime: number | null
   setPlaybackTime: React.Dispatch<React.SetStateAction<number | null>>
   isPlaying: boolean
   setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

const EarthquakesContext = createContext<EarthquakesContextValue | null>(null)

export function useEarthquakes(): EarthquakesContextValue {
   const context = useContext(EarthquakesContext)
   if (!context) {
      throw new Error('useEarthquakes must be used within an EarthquakesProvider')
   }
   return context
}

export function EarthquakesProvider({ children }: { children: ReactNode }) {
   const displayedEarthquakesGroupRef = useRef<THREE.Group>(new THREE.Group())
   const [earthquakeData, setEarthquakeData] = useState<UsgsEarthquakeFeature[]>([])
   const [selectedEarthquake, setSelectedEarthquake] = useState<UsgsEarthquakeFeature | null>(null)
   const [playbackTime, setPlaybackTime] = useState<number | null>(null)
   const [isPlaying, setIsPlaying] = useState<boolean>(false)

   const value: EarthquakesContextValue = useMemo(
      () => ({
         displayedEarthquakesGroup: displayedEarthquakesGroupRef.current,
         earthquakeData,
         setEarthquakeData,
         selectedEarthquake,
         setSelectedEarthquake,
         playbackTime,
         setPlaybackTime,
         isPlaying,
         setIsPlaying,
      }),
      [
         earthquakeData,
         selectedEarthquake,
         playbackTime,
         isPlaying,
      ],
   )

   return (
      <EarthquakesContext.Provider value={value}>
         {children}
      </EarthquakesContext.Provider>
   )
}
