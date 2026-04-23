import {
   usePlanesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/planesTab/planesTab.model'

export function PlanesTabController() {
   const { setPlanesActivated } = usePlanesTab()

   function activatePlanes(): void {
      setPlanesActivated(true)
   }

   function deactivatePlanes(): void {
      setPlanesActivated(false)
   }

   return {
      activatePlanes,
      deactivatePlanes,
   }
}