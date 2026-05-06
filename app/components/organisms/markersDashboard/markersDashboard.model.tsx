import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { Marker } from '@/app/types/marker'
import { CircleMarker } from '@/app/types/circleMarker'
import { DistanceMeasurement } from '@/app/types/distanceMeasurement'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'
import { STORAGE_KEY_CIRCLE_MARKERS, STORAGE_KEY_MARKERS } from '@/app/constants/storageKeys'
import { Coordinates } from '@/app/types/coordinates/coordinates'

interface MarkersDashboardContextValue {
   isMarkersDashboardOpen: boolean
   setIsMarkersDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>
   markers: Marker[]
   setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>
   circleMarkers: CircleMarker[]
   setCircleMarkers: React.Dispatch<React.SetStateAction<CircleMarker[]>>
   areMarkerTitlesVisible: boolean
   setAreMarkerTitlesVisible: React.Dispatch<React.SetStateAction<boolean>>
   coordinateSelectionMarkerId: string | null
   setCoordinateSelectionMarkerId: React.Dispatch<React.SetStateAction<string | null>>
   coordinateSelectionCircleId: string | null
   setCoordinateSelectionCircleId: React.Dispatch<React.SetStateAction<string | null>>
   distanceMeasurement: DistanceMeasurement | null
   setDistanceMeasurement: React.Dispatch<React.SetStateAction<DistanceMeasurement | null>>
   distanceFirstPoint: Coordinates | null
   setDistanceFirstPoint: React.Dispatch<React.SetStateAction<Coordinates | null>>
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
   const [markers, setMarkers] = useLocalStorageState<Marker[]>(STORAGE_KEY_MARKERS, [])
   const [circleMarkers, setCircleMarkers] = useLocalStorageState<CircleMarker[]>(STORAGE_KEY_CIRCLE_MARKERS, [])
   const [areMarkerTitlesVisible, setAreMarkerTitlesVisible] = useState<boolean>(true)
   const [coordinateSelectionMarkerId, setCoordinateSelectionMarkerId] = useState<string | null>(null)
   const [coordinateSelectionCircleId, setCoordinateSelectionCircleId] = useState<string | null>(null)
   const [distanceMeasurement, setDistanceMeasurement] = useState<DistanceMeasurement | null>(null)
   const [distanceFirstPoint, setDistanceFirstPoint] = useState<Coordinates | null>(null)

   const value: MarkersDashboardContextValue = useMemo(() => ({
      isMarkersDashboardOpen,
      setIsMarkersDashboardOpen,
      markers,
      setMarkers,
      circleMarkers,
      setCircleMarkers,
      areMarkerTitlesVisible,
      setAreMarkerTitlesVisible,
      coordinateSelectionMarkerId,
      setCoordinateSelectionMarkerId,
      coordinateSelectionCircleId,
      setCoordinateSelectionCircleId,
      distanceMeasurement,
      setDistanceMeasurement,
      distanceFirstPoint,
      setDistanceFirstPoint,
   }), [
      isMarkersDashboardOpen,
      markers,
      circleMarkers,
      areMarkerTitlesVisible,
      coordinateSelectionMarkerId,
      coordinateSelectionCircleId,
      distanceMeasurement,
      distanceFirstPoint,
   ])

   return (
      <MarkersDashboardContext.Provider value={value}>
         {children}
      </MarkersDashboardContext.Provider>
   )
}
