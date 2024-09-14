'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'

// TODO : Add types.
interface PlaneMapContextValue {
   planeMap: any
   setPlaneMap: React.Dispatch<React.SetStateAction<any>>
   mapProvider: any
   setMapProvider: React.Dispatch<React.SetStateAction<any>>
   mapStyle: string
   setMapStyle: React.Dispatch<React.SetStateAction<any>>
}

const PlaneMapContext = createContext<PlaneMapContextValue | null>(null)

export function usePlaneMap(): PlaneMapContextValue {
   const context = useContext(PlaneMapContext)
   if (!context) {
      throw new Error('usePlaneMap must be used within a PlaneMapProvider')
   }
   return context
}

export function PlaneMapProvider({ children }: { children: ReactNode }) {
// TODO : Add types.
   const [planeMap, setPlaneMap] = useState<any>(null)
   const [mapProvider, setMapProvider] = useState<any>(null)
   const [mapStyle, setMapStyle] = useState<any>(null)

   const value: PlaneMapContextValue = {
      planeMap: planeMap,
      setPlaneMap: setPlaneMap,
      mapProvider: mapProvider,
      setMapProvider: setMapProvider,
      mapStyle: mapStyle,
      setMapStyle: setMapStyle,
   }

   return <PlaneMapContext.Provider value={value}>{children}</PlaneMapContext.Provider>
}
