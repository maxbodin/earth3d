import React, { createContext, ReactNode, useContext } from 'react'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'
import {
   STORAGE_KEY_EARTHQUAKES_ACTIVATED,
   STORAGE_KEY_EARTHQUAKES_DEPTH_LINES,
   STORAGE_KEY_EARTHQUAKES_HEATMAP,
   STORAGE_KEY_EARTHQUAKES_MIN_MAGNITUDE,
   STORAGE_KEY_EARTHQUAKES_TIME_RANGE,
} from '@/app/constants/storageKeys'
import { TimeRangeLabel } from '@/app/types/timeRangeLabel'

interface EarthquakesTabContextValue {
   earthquakesActivated: boolean
   setEarthquakesActivated: React.Dispatch<React.SetStateAction<boolean>>
   earthquakeHeatmapEnabled: boolean
   setEarthquakeHeatmapEnabled: React.Dispatch<React.SetStateAction<boolean>>
   earthquakeDepthLinesEnabled: boolean
   setEarthquakeDepthLinesEnabled: React.Dispatch<React.SetStateAction<boolean>>
   earthquakeMinMagnitude: number
   setEarthquakeMinMagnitude: React.Dispatch<React.SetStateAction<number>>
   earthquakeTimeRange: TimeRangeLabel
   setEarthquakeTimeRange: React.Dispatch<React.SetStateAction<TimeRangeLabel>>
}

const EarthquakesTabContext = createContext<EarthquakesTabContextValue | null>(null)

export function useEarthquakesTab(): EarthquakesTabContextValue {
   const context = useContext(EarthquakesTabContext)
   if (!context) {
      throw new Error('useEarthquakesTab must be used within an EarthquakesTabProvider')
   }
   return context
}

export function EarthquakesTabProvider({ children }: { children: ReactNode }) {
   const [earthquakesActivated, setEarthquakesActivated] = useLocalStorageState<boolean>(
      STORAGE_KEY_EARTHQUAKES_ACTIVATED, false,
   )
   const [earthquakeHeatmapEnabled, setEarthquakeHeatmapEnabled] = useLocalStorageState<boolean>(
      STORAGE_KEY_EARTHQUAKES_HEATMAP, false,
   )
   const [earthquakeDepthLinesEnabled, setEarthquakeDepthLinesEnabled] = useLocalStorageState<boolean>(
      STORAGE_KEY_EARTHQUAKES_DEPTH_LINES, true,
   )
   const [earthquakeMinMagnitude, setEarthquakeMinMagnitude] = useLocalStorageState<number>(
      STORAGE_KEY_EARTHQUAKES_MIN_MAGNITUDE, 2.5,
   )
   const [earthquakeTimeRange, setEarthquakeTimeRange] = useLocalStorageState<TimeRangeLabel>(
      STORAGE_KEY_EARTHQUAKES_TIME_RANGE, 'day',
   )

   const value: EarthquakesTabContextValue = {
      earthquakesActivated,
      setEarthquakesActivated,
      earthquakeHeatmapEnabled,
      setEarthquakeHeatmapEnabled,
      earthquakeDepthLinesEnabled,
      setEarthquakeDepthLinesEnabled,
      earthquakeMinMagnitude,
      setEarthquakeMinMagnitude,
      earthquakeTimeRange,
      setEarthquakeTimeRange,
   }

   return (
      <EarthquakesTabContext.Provider value={value}>
         {children}
      </EarthquakesTabContext.Provider>
   )
}
