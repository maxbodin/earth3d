import {
   useAirportsTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/airportsTab/airportsTab.model'


export function AirportsTabController() {
   const { setAirportsActivated } = useAirportsTab()

   function activateAirports(): void {
      setAirportsActivated(true)
   }

   function deactivateAirports(): void {
      setAirportsActivated(false)
   }

   return {
      activateAirports,
      deactivateAirports,
   }
}
