import { TAB_TITLES } from '@/app/constants/strings'
import { useSettingsDashboard } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'
import { TabType } from '@/app/enums/tabType'

export function SettingsDashboardController() {
   const { setActiveSettingsDashboardTab } = useSettingsDashboard()

   /**
    *
    * @param tabName
    */
   function onTabSelection(tabName: string): void {
      const selectedTabIndex = TAB_TITLES.indexOf(tabName)

      if (selectedTabIndex < 0) {
         return
      }

      setActiveSettingsDashboardTab(selectedTabIndex as TabType)
   }

   return {
      onTabSelection,
   }
}
