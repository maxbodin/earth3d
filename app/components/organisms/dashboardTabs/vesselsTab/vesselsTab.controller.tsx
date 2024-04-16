import { useVesselsTab } from '@/app/components/organisms/dashboardTabs/vesselsTab/vesselsTab.model'
import {
   startConnection,
   stopConnection,
} from '@/app/server/services/vesselDataService'
import { useData } from '@/app/context/dataContext'

export function VesselsTabController() {
   const { setVesselsActivated } = useVesselsTab()
   const { setVesselsData } = useData()

   function activateVessels(): void {
      setVesselsActivated(true)
      startConnection()
   }

   function deactivateVessels(): void {
      setVesselsActivated(false)
      stopConnection()
      setVesselsData(null)
   }

   return {
      activateVessels,
      deactivateVessels,
   }
}
