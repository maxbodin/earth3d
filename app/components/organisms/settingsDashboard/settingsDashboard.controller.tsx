import { useSettingsDashboard } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'
import { TabType } from '@/app/enums/tabType'

export function SettingsDashboardController() {
   const { setActiveSettingsDashboardTab } = useSettingsDashboard()

   /**
    *
    * @param tabType
    */
   function onTabSelection(tabType: TabType): void {
      setActiveSettingsDashboardTab(tabType)
   }

   return {
      onTabSelection,
   }
}
