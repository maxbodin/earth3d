import React, { createContext, ReactNode, useContext, useState } from 'react'
import { DEFAULT_MAP_STYLE_ID } from '@/app/constants/mapStyles'

interface MapTabContextValue {
   activeMapStyleId: string
   setActiveMapStyleId: React.Dispatch<React.SetStateAction<string>>
}

const MapTabContext = createContext<MapTabContextValue | null>(null)

export function useMapTab(): MapTabContextValue {
   const context = useContext(MapTabContext)
   if (!context) {
      throw new Error('useMapTab must be used within a MapTabProvider')
   }
   return context
}

export function MapTabProvider({ children }: { children: ReactNode }) {
   const [activeMapStyleId, setActiveMapStyleId] = useState<string>(
      DEFAULT_MAP_STYLE_ID,
   )

   const value: MapTabContextValue = {
      activeMapStyleId,
      setActiveMapStyleId,
   }

   return (
      <MapTabContext.Provider value={value}>{children}</MapTabContext.Provider>
   )
}
