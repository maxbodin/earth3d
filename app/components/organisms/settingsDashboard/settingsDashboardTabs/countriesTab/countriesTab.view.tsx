import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'
import {
   useCountriesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/countriesTab/countriesTab.model'
import {
   CountriesTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/countriesTab/countriesTab.controller'

export function CountriesTabView() {
   const { frontiersActivated, namesActivated } = useCountriesTab()

   const {
      activateFrontiers,
      activateNames,
      deactivateFrontiers,
      deactivateNames,
   } = CountriesTabController()

   return (
      <div className="flex flex-col w-full">
         <SwitchTitled
            title={'Activate countries frontiers on Map'}
            defaultChecked={frontiersActivated}
            onCheck={activateFrontiers}
            onUncheck={deactivateFrontiers}
         />
         <SwitchTitled
            title={'Activate countries names on Map'}
            defaultChecked={namesActivated}
            onCheck={activateNames}
            onUncheck={deactivateNames}
         />
      </div>
   )
}
