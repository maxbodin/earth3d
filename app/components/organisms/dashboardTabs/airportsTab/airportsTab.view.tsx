import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'
import { useAirportsTab } from '@/app/components/organisms/dashboardTabs/airportsTab/airportsTab.model'
import { AirportsTabController } from '@/app/components/organisms/dashboardTabs/airportsTab/airportsTab.controller'

export function AirportsTabView() {
   const { airportsActivated } = useAirportsTab()

   const { activateAirports, deactivateAirports } = AirportsTabController()

   return (
      <div className="p-4">
         <SwitchTitled
            title={'Activate airports on Map'}
            defaultChecked={airportsActivated}
            onCheck={activateAirports}
            onUncheck={deactivateAirports}
         />
      </div>
   )
}
