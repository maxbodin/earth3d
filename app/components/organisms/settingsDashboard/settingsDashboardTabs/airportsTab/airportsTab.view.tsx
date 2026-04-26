import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled'
import {
   useAirportsTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/airportsTab/airportsTab.model'
import {
   AirportsTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/airportsTab/airportsTab.controller'

export function AirportsTabView() {
   const { airportsActivated } = useAirportsTab()

   const { activateAirports, deactivateAirports } = AirportsTabController()

   return (
      <div className="flex flex-col w-full">
         <SwitchTitled
            title={'Activate airports on Map'}
            defaultChecked={airportsActivated}
            onCheck={activateAirports}
            onUncheck={deactivateAirports}
         />
      </div>
   )
}
