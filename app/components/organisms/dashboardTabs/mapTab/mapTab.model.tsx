import React, { createContext, ReactNode, useContext, useState } from 'react'

interface MapTabContextValue {
   satelliteMapStyleActivated: boolean
   setSatelliteMapStyleActivated: React.Dispatch<React.SetStateAction<any>>

   purpleElevationMapStyleActivated: boolean
   setPurpleElevationMapStyleActivated: React.Dispatch<
      React.SetStateAction<boolean>
   >
   blackLabelMapStyleActivated: boolean
   setBlackLabelMapStyleActivated: React.Dispatch<React.SetStateAction<boolean>>
   activateTrafficMapStyleActivated: boolean
   setActivateTrafficMapStyleActivated: React.Dispatch<
      React.SetStateAction<boolean>
   >
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
   const [satelliteMapStyleActivated, setSatelliteMapStyleActivated] =
      useState<boolean>(true)

   const [
      purpleElevationMapStyleActivated,
      setPurpleElevationMapStyleActivated,
   ] = useState<boolean>(false)

   const [blackLabelMapStyleActivated, setBlackLabelMapStyleActivated] =
      useState<boolean>(false)

   const [
      activateTrafficMapStyleActivated,
      setActivateTrafficMapStyleActivated,
   ] = useState<boolean>(false)

   const value: MapTabContextValue = {
      satelliteMapStyleActivated,
      setSatelliteMapStyleActivated,
      purpleElevationMapStyleActivated,
      setPurpleElevationMapStyleActivated,
      blackLabelMapStyleActivated,
      setBlackLabelMapStyleActivated,
      activateTrafficMapStyleActivated,
      setActivateTrafficMapStyleActivated,
   }

   return (
      <MapTabContext.Provider value={value}>{children}</MapTabContext.Provider>
   )
}
