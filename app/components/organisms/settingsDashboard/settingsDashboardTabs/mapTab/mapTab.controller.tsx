'use client'
import { useMapTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.model'
import { usePlaneMap } from '@/app/components/atoms/three/planeMapContext'
import { MAP_STYLE_SECTIONS } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.styles'
import { DEFAULT_MAP_STYLE_ID } from '@/app/constants/mapStyles'

export function useMapTabController() {
   const { activeMapStyleId, setActiveMapStyleId } = useMapTab()
   const { mapProvider, setMapStyle } = usePlaneMap()

   function applyMapStyle(mapStyleId: string): void {
      setActiveMapStyleId(mapStyleId)
      setMapStyle(mapStyleId)

      if (mapProvider != null) {
         mapProvider.mapStyle = mapStyleId
      }
   }

   function activateMapStyle(mapStyleId: string): void {
      applyMapStyle(mapStyleId)
   }

   function deactivateMapStyle(fallbackStyleId: string = DEFAULT_MAP_STYLE_ID): void {
      applyMapStyle(fallbackStyleId)
   }

   return {
      activeMapStyleId,
      activateMapStyle,
      deactivateMapStyle,
      mapStyleSections: MAP_STYLE_SECTIONS,
   }
}
