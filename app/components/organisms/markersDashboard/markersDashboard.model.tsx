import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { Marker } from '@/app/types/marker'
import { DistanceMeasurement } from '@/app/types/distanceMeasurement'

interface MarkersDashboardContextValue {
   isMarkersDashboardOpen: boolean
   setIsMarkersDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>
   markers: Marker[]
   setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>
   areMarkerTitlesVisible: boolean
   setAreMarkerTitlesVisible: React.Dispatch<React.SetStateAction<boolean>>
   coordinateSelectionMarkerId: string | null
   setCoordinateSelectionMarkerId: React.Dispatch<React.SetStateAction<string | null>>
   distanceMeasurement: DistanceMeasurement | null
   setDistanceMeasurement: React.Dispatch<React.SetStateAction<DistanceMeasurement | null>>
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
   const [areMarkerTitlesVisible, setAreMarkerTitlesVisible] = useState<boolean>(true)
   const [coordinateSelectionMarkerId, setCoordinateSelectionMarkerId] = useState<string | null>(null)
   const [distanceMeasurement, setDistanceMeasurement] = useState<DistanceMeasurement | null>(null)

   const value: MarkersDashboardContextValue = useMemo(() => ({
      isMarkersDashboardOpen,
      setIsMarkersDashboardOpen,
      markers,
      setMarkers,
      areMarkerTitlesVisible,
      setAreMarkerTitlesVisible,
      coordinateSelectionMarkerId,
      setCoordinateSelectionMarkerId,
      distanceMeasurement,
      setDistanceMeasurement,
   }), [
      isMarkersDashboardOpen,
      markers,
      areMarkerTitlesVisible,
      coordinateSelectionMarkerId,
      distanceMeasurement,
   ])

   return (
      <MarkersDashboardContext.Provider value={value}>
         {children}
      </MarkersDashboardContext.Provider>
   )
}
