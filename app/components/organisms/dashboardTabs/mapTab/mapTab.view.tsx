import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'
import { useMapTab } from '@/app/components/organisms/dashboardTabs/mapTab/mapTab.model'
import { MapTabController } from '@/app/components/organisms/dashboardTabs/mapTab/mapTab.controller'

export function MapTabView() {
   const {
      satelliteMapStyleActivated,
      purpleElevationMapStyleActivated,
      blackLabelMapStyleActivated,
      activateTrafficMapStyleActivated,
   } = useMapTab()

   const {
      activatePurpleElevationMapStyle,
      activateBlackLabelMapStyle,
      activateSatelliteMapStyle,
      deactivateSatelliteMapStyle,
      activateTrafficMapStyle,
      // TODO activateTerrainMapStyle,
      // TODO activateTerrainDEMMapStyle,
   } = MapTabController()

   return (
      <div className="flex flex-col w-full">
         <SwitchTitled
            title={'Activate Satellite style on Map'}
            defaultChecked={satelliteMapStyleActivated}
            onCheck={activateSatelliteMapStyle}
            onUncheck={deactivateSatelliteMapStyle}
         />
         <SwitchTitled
            title={'Activate Purple Elevation style on Map'}
            defaultChecked={purpleElevationMapStyleActivated}
            onCheck={activatePurpleElevationMapStyle}
            onUncheck={activateSatelliteMapStyle}
         />
         <SwitchTitled
            title={'Activate Black Label style on Map'}
            defaultChecked={blackLabelMapStyleActivated}
            onCheck={activateBlackLabelMapStyle}
            onUncheck={activateSatelliteMapStyle}
         />
         <SwitchTitled
            title={'Activate Traffic style on Map'}
            defaultChecked={activateTrafficMapStyleActivated}
            onCheck={activateTrafficMapStyle}
            onUncheck={activateSatelliteMapStyle}
         />
      </div>
   )
}
