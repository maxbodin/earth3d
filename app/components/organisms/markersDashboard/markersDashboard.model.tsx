import React, { createContext, ReactNode, useContext, useState } from 'react'
import { Marker } from '@/app/types/marker'

interface MarkersDashboardContextValue {
   isMarkersDashboardOpen: boolean
   setIsMarkersDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>
   markers: Marker[]
   setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>
   coordinateSelectionMarkerId: string | null
   setCoordinateSelectionMarkerId: React.Dispatch<React.SetStateAction<string | null>>
}

const MarkersDashboardContext = createContext<MarkersDashboardContextValue | null>(null)

export function useMarkersDashboard(): MarkersDashboardContextValue {
   const context = useContext(MarkersDashboardContext)
   if (!context) {
      throw new Error('useMarkersDashboard must be used within a MarkersDashboardProvider')
   }
   return context
}

export function MarkersDashboardProvider({ children }: { children: ReactNode }) {
   const [isMarkersDashboardOpen, setIsMarkersDashboardOpen] = useState<boolean>(false)
   const [markers, setMarkers] = useState<Marker[]>([])
   const [coordinateSelectionMarkerId, setCoordinateSelectionMarkerId] = useState<string | null>(null)

   const value: MarkersDashboardContextValue = {
      isMarkersDashboardOpen: isMarkersDashboardOpen,
      setIsMarkersDashboardOpen: setIsMarkersDashboardOpen,
      markers: markers,
      setMarkers: setMarkers,
      coordinateSelectionMarkerId: coordinateSelectionMarkerId,
      setCoordinateSelectionMarkerId: setCoordinateSelectionMarkerId,
   }

   return (
      <MarkersDashboardContext.Provider value={value}>
         {children}
      </MarkersDashboardContext.Provider>
   )
}
