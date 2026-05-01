import React, { createContext, ReactNode, useContext } from 'react'
import { DEFAULT_MAP_STYLE_ID } from '@/app/constants/mapStyles'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'
import {
   STORAGE_KEY_DEBUG_TILES,
   STORAGE_KEY_DEBUG_TILES_OPACITY,
   STORAGE_KEY_MAP_STYLE,
   STORAGE_KEY_TECTONIC_PLATES,
   STORAGE_KEY_TECTONIC_PLATES_OPACITY,
} from '@/app/constants/storageKeys'

interface MapTabContextValue {
   activeMapStyleId: string
   setActiveMapStyleId: React.Dispatch<React.SetStateAction<string>>
   tectonicPlatesEnabled: boolean
   setTectonicPlatesEnabled: React.Dispatch<React.SetStateAction<boolean>>
   tectonicPlatesOpacity: number
   setTectonicPlatesOpacity: React.Dispatch<React.SetStateAction<number>>
   debugTilesEnabled: boolean
   setDebugTilesEnabled: React.Dispatch<React.SetStateAction<boolean>>
   debugTilesOpacity: number
   setDebugTilesOpacity: React.Dispatch<React.SetStateAction<number>>
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
   const [activeMapStyleId, setActiveMapStyleId] = useLocalStorageState<string>(
      STORAGE_KEY_MAP_STYLE, DEFAULT_MAP_STYLE_ID,
   )
   const [tectonicPlatesEnabled, setTectonicPlatesEnabled] = useLocalStorageState<boolean>(
      STORAGE_KEY_TECTONIC_PLATES, false,
   )
   const [tectonicPlatesOpacity, setTectonicPlatesOpacity] = useLocalStorageState<number>(
      STORAGE_KEY_TECTONIC_PLATES_OPACITY, 100,
   )
   const [debugTilesEnabled, setDebugTilesEnabled] = useLocalStorageState<boolean>(
      STORAGE_KEY_DEBUG_TILES, false,
   )
   const [debugTilesOpacity, setDebugTilesOpacity] = useLocalStorageState<number>(
      STORAGE_KEY_DEBUG_TILES_OPACITY, 50,
   )

   const value: MapTabContextValue = {
      activeMapStyleId,
      setActiveMapStyleId,
      tectonicPlatesEnabled,
      setTectonicPlatesEnabled,
      tectonicPlatesOpacity,
      setTectonicPlatesOpacity,
      debugTilesEnabled,
      setDebugTilesEnabled,
      debugTilesOpacity,
      setDebugTilesOpacity,
   }

   return (
      <MapTabContext.Provider value={value}>{children}</MapTabContext.Provider>
   )
}
