import { useEffect } from 'react'
import {
   useAirportsTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/airportsTab/airportsTab.model'
import {
   AirportsTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/airportsTab/airportsTab.controller'
import {
   useVesselsTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/vesselsTab/vesselsTab.model'
import {
   VesselsTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/vesselsTab/vesselsTab.controller'

export function SettingsDashboardTabsExecuteDefaultValues(): null {
   const { airportsActivated } = useAirportsTab()
   const { activateAirports, deactivateAirports } = AirportsTabController()

   useEffect((): void => {
      airportsActivated ?
         activateAirports() :
         deactivateAirports()

   }, [airportsActivated, activateAirports, deactivateAirports])


   const { activateVessels, deactivateVessels } = VesselsTabController()
   const { vesselsActivated } = useVesselsTab()

   useEffect((): void => {
      vesselsActivated ?
         activateVessels() :
         deactivateVessels()

   }, [vesselsActivated])

   return null
}
