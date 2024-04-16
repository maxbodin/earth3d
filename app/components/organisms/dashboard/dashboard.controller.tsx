import { useDashboard } from '@/app/components/organisms/dashboard/dashboard.model'
import { TAB_TITLES } from '@/app/constants/strings'

export function DashboardController() {
   const { setActiveDashboardTab } = useDashboard()

   function onTabSelection(tabName: string): void {
      switch (tabName) {
         case TAB_TITLES[0]:
            setActiveDashboardTab(0)
            break
         case TAB_TITLES[1]:
            setActiveDashboardTab(1)
            break
         case TAB_TITLES[2]:
            setActiveDashboardTab(2)
            break
         case TAB_TITLES[3]:
            setActiveDashboardTab(3)
            break
         case TAB_TITLES[4]:
            setActiveDashboardTab(4)
            break
         case TAB_TITLES[5]:
            setActiveDashboardTab(5)
            break
      }
   }

   return {
      onTabSelection,
   }
}
