import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { OpenSkyTrackWaypoint } from '@/app/types/openSky/openSkyTrackWaypoint'

interface DataContextValue {
   planesData: OpenSkyStateVector[]
   setPlanesData: React.Dispatch<React.SetStateAction<OpenSkyStateVector[]>>
   planeTrackData: OpenSkyTrackWaypoint[]
   setPlaneTrackData: React.Dispatch<React.SetStateAction<OpenSkyTrackWaypoint[]>>
}

const DataContext = createContext<DataContextValue | null>(null)

export function useData(): DataContextValue {
   const context = useContext(DataContext)
   if (!context) {
      throw new Error('useData must be used within a DataProvider')
   }
   return context
}

export function DataProvider({ children }: { children: ReactNode }) {
   const [planesData, setPlanesData] = useState<OpenSkyStateVector[]>([])
   const [planeTrackData, setPlaneTrackData] = useState<OpenSkyTrackWaypoint[]>([])

   const value: DataContextValue = useMemo(
      () => ({
         planesData,
         setPlanesData,
         planeTrackData,
         setPlaneTrackData,
      }),
      [planesData, planeTrackData, setPlanesData, setPlaneTrackData],
   )

   return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
