import {
   useVolcanoesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.model'

export function VolcanoesTabController() {
   const { setVolcanoesActivated } = useVolcanoesTab()

   function activateVolcanoes(): void {
      setVolcanoesActivated(true)
   }

   function deactivateVolcanoes(): void {
      setVolcanoesActivated(false)
   }

   return {
      activateVolcanoes,
      deactivateVolcanoes,
   }
}
