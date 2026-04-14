'use client'
import { useMapTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.model'
import { usePlaneMap } from '@/app/components/atoms/three/planeMapContext'
import {
   MAP_STYLE_SECTIONS
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.styles'

export function useMapTabController() {
   const { activeMapStyleId, setActiveMapStyleId } = useMapTab()
   const { setMapStyle } = usePlaneMap()

   /**
    * Selects a new map style.
    */
   function selectMapStyle(mapStyleId: string): void {
      setActiveMapStyleId(mapStyleId)
      setMapStyle(mapStyleId)
   }

   return {
      activeMapStyleId,
      selectMapStyle,
      mapStyleSections: MAP_STYLE_SECTIONS,
   }
}
