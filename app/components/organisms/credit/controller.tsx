import { useCredit } from '@/app/components/organisms/credit/model'
import { TAB_TITLES } from '@/app/constants/strings'

export function CreditController() {
   const { setActiveCreditTab } = useCredit()

   function onTabSelection(tabName: string): void {
      switch (tabName) {
         case TAB_TITLES[0]:
            setActiveCreditTab(0)
            break
         case TAB_TITLES[1]:
            setActiveCreditTab(1)
            break
         case TAB_TITLES[2]:
            setActiveCreditTab(2)
            break
         case TAB_TITLES[3]:
            setActiveCreditTab(3)
            break
         case TAB_TITLES[4]:
            setActiveCreditTab(4)
            break
      }
   }

   return {
      onTabSelection,
   }
}
