'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'

interface MapContextValue {
   map: any
   setMap: React.Dispatch<React.SetStateAction<any>>
   mapProvider: any
   setMapProvider: React.Dispatch<React.SetStateAction<any>>
   mapStyle: string
   setMapStyle: React.Dispatch<React.SetStateAction<any>>
}

// Create context.
const MapContext = createContext<MapContextValue | null>(null)

// Custom hook to access context.
export function useMap(): MapContextValue {
   const context = useContext(MapContext)
   if (!context) {
      throw new Error('useMap must be used within a MapProvider')
   }
   return context
}

// Provider component.
export function MapProvider({ children }: { children: ReactNode }) {
   const [map, setMap] = useState<any>(null)
   const [mapProvider, setMapProvider] = useState<any>(null)
   const [mapStyle, setMapStyle] = useState<any>(null)

   const value: MapContextValue = {
      map,
      setMap,
      mapProvider,
      setMapProvider,
      mapStyle,
      setMapStyle,
   }

   return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}
