import { useMapTab } from '@/app/components/organisms/dashboardTabs/mapTab/mapTab.model'
import { useMap } from '@/app/context/mapContext'

export function MapTabController() {
   const {
      setSatelliteMapStyleActivated,
      setPurpleElevationMapStyleActivated,
      setBlackLabelMapStyleActivated,
      setActivateTrafficMapStyleActivated,
   } = useMapTab()
   const { mapProvider } = useMap()

   function activateBlackLabelMapStyle(): void {
      deactivateAllMapStyles()
      mapProvider.mapStyle = 'mapbox.mapbox-streets-v7'
      setBlackLabelMapStyleActivated(true)
   }

   function activatePurpleElevationMapStyle(): void {
      deactivateAllMapStyles()
      mapProvider.mapStyle = 'mapbox.mapbox-terrain-v2'
      setPurpleElevationMapStyleActivated(true)
   }

   function activateSatelliteMapStyle(): void {
      deactivateAllMapStyles()
      mapProvider.mapStyle = 'mapbox.satellite'
      setSatelliteMapStyleActivated(true)
   }

   function activateTrafficMapStyle(): void {
      deactivateAllMapStyles()
      mapProvider.mapStyle = 'mapbox.mapbox-traffic-v1'
      setActivateTrafficMapStyleActivated(true)
   }

   // TODO Implement
   function activateTerrainMapStyle(): void {
      deactivateAllMapStyles()
      mapProvider.mapStyle = 'mapbox.terrain-rgb'
   }

   // TODO Implement
   function activateTerrainDEMMapStyle(): void {
      deactivateAllMapStyles()
      mapProvider.mapStyle = 'mapbox.mapbox-terrain-dem-v1'
   }

   /**
    * Still set to a default type when deactivating satellite style.
    */
   function deactivateSatelliteMapStyle(): void {
      activateBlackLabelMapStyle()
   }

   function deactivateAllMapStyles(): void {
      setBlackLabelMapStyleActivated(false)
      setPurpleElevationMapStyleActivated(false)
      setSatelliteMapStyleActivated(false)
      setActivateTrafficMapStyleActivated(false)
   }

   return {
      activatePurpleElevationMapStyle,
      activateBlackLabelMapStyle,
      activateSatelliteMapStyle,
      deactivateSatelliteMapStyle,
      activateTrafficMapStyle,
      activateTerrainMapStyle,
      activateTerrainDEMMapStyle,
   }
}
