import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'
import {
   usePlanesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/planesTab/planesTab.model'
import {
   PlanesTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/planesTab/planesTab.controller'
import { usePlanes } from '@/app/components/atoms/three/planes/planes.model'

export function PlanesTabView() {
   const { planesActivated } = usePlanesTab()
   const { activatePlanes, deactivatePlanes } = PlanesTabController()
   const { openSkyRemainingTokens } = usePlanes()

   return (
      <div className="flex flex-col w-full">
         <SwitchTitled
            title={'Activate planes on Map'}
            defaultChecked={planesActivated}
            onCheck={activatePlanes}
            onUncheck={deactivatePlanes}
         />
         <div className="px-8 pb-8 text-sm text-white/70">
            OpenSky remaining tokens today: {openSkyRemainingTokens == null ? 'N/A' : openSkyRemainingTokens.toLocaleString()}
         </div>
      </div>
   )
}