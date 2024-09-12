import { startConnection, stopConnection } from '@/app/server/services/vesselDataService'
import { useVessels } from '@/app/components/atoms/three/vessels/vessels.model'

export function VesselsTabController() {
   const { setVesselsRawData } = useVessels()

   function activateVessels(): void {
      startConnection()
   }

   function deactivateVessels(): void {
      stopConnection()
      setVesselsRawData([])
   }

   return {
      activateVessels,
      deactivateVessels,
   }
}
