'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'
import { useMapTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.model'

// TODO : Add types.
interface PlaneMapContextValue {
   planeMap: any
   setPlaneMap: React.Dispatch<React.SetStateAction<any>>
   mapProvider: any
   setMapProvider: React.Dispatch<React.SetStateAction<any>>
   mapStyle: string
   setMapStyle: React.Dispatch<React.SetStateAction<string>>
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
   const { activeMapStyleId } = useMapTab()
   const [planeMap, setPlaneMap] = useState<any>(null)
   const [mapProvider, setMapProvider] = useState<any>(null)
   const [mapStyle, setMapStyle] = useState<string>(activeMapStyleId)

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
