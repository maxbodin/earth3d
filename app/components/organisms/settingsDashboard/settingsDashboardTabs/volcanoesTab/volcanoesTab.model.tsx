import React, { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'
import {
   STORAGE_KEY_VOLCANOES_ACTIVATED,
   STORAGE_KEY_VOLCANOES_HEATMAP,
} from '@/app/constants/storageKeys'

interface VolcanoesTabContextValue {
   eruptionYearMax: number
   eruptionYearMin: number
   eruptionYearRangeMax: number
   eruptionYearRangeMin: number
   initYearRange: (min: number, max: number) => void
   setEruptionYearRange: (range: [number, number]) => void
   setVolcanoesActivated: React.Dispatch<React.SetStateAction<boolean>>
   setVolcanoHeatmapEnabled: React.Dispatch<React.SetStateAction<boolean>>
   volcanoesActivated: boolean
   volcanoHeatmapEnabled: boolean
}

const VolcanoesTabContext = createContext<VolcanoesTabContextValue | null>(null)

export function useVolcanoesTab(): VolcanoesTabContextValue {
   const context = useContext(VolcanoesTabContext)
   if (!context) {
      throw new Error('useVolcanoesTab must be used within a VolcanoesTabProvider')
   }
   return context
}

const FALLBACK_YEAR_MIN = 1900
const FALLBACK_YEAR_MAX = new Date().getFullYear()

export function VolcanoesTabProvider({ children }: { children: ReactNode }) {
   const [volcanoesActivated, setVolcanoesActivated] = useLocalStorageState<boolean>(
      STORAGE_KEY_VOLCANOES_ACTIVATED, false,
   )
   const [volcanoHeatmapEnabled, setVolcanoHeatmapEnabled] = useLocalStorageState<boolean>(
      STORAGE_KEY_VOLCANOES_HEATMAP, false,
   )
   const [eruptionYearRangeMin, setEruptionYearRangeMin] = useState<number>(FALLBACK_YEAR_MIN)
   const [eruptionYearRangeMax, setEruptionYearRangeMax] = useState<number>(FALLBACK_YEAR_MAX)
   const [eruptionYearMin, setEruptionYearMin] = useState<number>(FALLBACK_YEAR_MIN)
   const [eruptionYearMax, setEruptionYearMax] = useState<number>(FALLBACK_YEAR_MAX)
   const initializedRef = useRef(false)

   const initYearRange = useCallback((min: number, max: number): void => {
      if (initializedRef.current) return
      initializedRef.current = true
      setEruptionYearRangeMin(min)
      setEruptionYearRangeMax(max)
      setEruptionYearMin(min)
      setEruptionYearMax(max)
   }, [])

   const setEruptionYearRange = useCallback(([min, max]: [number, number]): void => {
      setEruptionYearMin(min)
      setEruptionYearMax(max)
   }, [])

   const value: VolcanoesTabContextValue = useMemo(
      () => ({
         eruptionYearMax,
         eruptionYearMin,
         eruptionYearRangeMax,
         eruptionYearRangeMin,
         initYearRange,
         setEruptionYearRange,
         setVolcanoesActivated,
         setVolcanoHeatmapEnabled,
         volcanoesActivated,
         volcanoHeatmapEnabled,
      }),
      [
         eruptionYearMax,
         eruptionYearMin,
         eruptionYearRangeMax,
         eruptionYearRangeMin,
         initYearRange,
         setEruptionYearRange,
         volcanoesActivated,
         volcanoHeatmapEnabled,
         setVolcanoesActivated,
         setVolcanoHeatmapEnabled,
      ],
   )

   return (
      <VolcanoesTabContext.Provider value={value}>
         {children}
      </VolcanoesTabContext.Provider>
   )
}
