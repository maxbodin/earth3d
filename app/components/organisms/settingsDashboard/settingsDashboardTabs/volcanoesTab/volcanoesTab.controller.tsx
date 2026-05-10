import {
   useVolcanoesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.model'

export function VolcanoesTabController() {
   const {
      setVolcanoesActivated,
      setVolcanoHeatmapEnabled,
   } = useVolcanoesTab()

   function activateVolcanoes(): void {
      setVolcanoesActivated(true)
   }

   function deactivateVolcanoes(): void {
      setVolcanoesActivated(false)
   }

   function enableHeatmap(): void {
      setVolcanoHeatmapEnabled(true)
   }

   function disableHeatmap(): void {
      setVolcanoHeatmapEnabled(false)
   }

   return {
      activateVolcanoes,
      deactivateVolcanoes,
      disableHeatmap,
      enableHeatmap,
   }
}
