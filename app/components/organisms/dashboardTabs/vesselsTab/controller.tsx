import { useVesselsTab } from '@/app/components/organisms/dashboardTabs/vesselsTab/model'

export function VesselsTabController() {
   const { setVesselsActivated } = useVesselsTab()

   function activateVessels(): void {
      setVesselsActivated(true)
   }

   function deactivateVessels(): void {
      setVesselsActivated(false)
   }

   return {
      activateVessels,
      deactivateVessels,
   }
}
