import { TAB_TITLES } from '@/app/constants/strings'
import { useSettingsDashboard } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'

export function SettingsDashboardController() {
   const { setActiveSettingsDashboardTab } = useSettingsDashboard()

   function onTabSelection(tabName: string): void {
      switch (tabName) {
         case TAB_TITLES[0]:
            setActiveSettingsDashboardTab(0)
            break
         case TAB_TITLES[1]:
            setActiveSettingsDashboardTab(1)
            break
         case TAB_TITLES[2]:
            setActiveSettingsDashboardTab(2)
            break
         case TAB_TITLES[3]:
            setActiveSettingsDashboardTab(3)
            break
         case TAB_TITLES[4]:
            setActiveSettingsDashboardTab(4)
            break
         case TAB_TITLES[5]:
            setActiveSettingsDashboardTab(5)
            break
      }
   }

   return {
      onTabSelection,
   }
}
