import { useCountriesTab } from '@/app/components/organisms/dashboardTabs/countriesTab/countriesTab.model'

export function CountriesTabController() {
   const { setNamesActivated, setFrontiersActivated } = useCountriesTab()

   function activateFrontiers(): void {
      setFrontiersActivated(true)
   }

   function activateNames(): void {
      setNamesActivated(true)
   }

   function deactivateFrontiers(): void {
      setFrontiersActivated(false)
   }

   function deactivateNames(): void {
      setNamesActivated(false)
   }

   return {
      activateFrontiers,
      activateNames,
      deactivateFrontiers,
      deactivateNames,
   }
}
