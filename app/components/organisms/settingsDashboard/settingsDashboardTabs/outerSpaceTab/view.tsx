import {
   OuterSpaceTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/outerSpaceTab/controller'
import {
   useOuterSpaceTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/outerSpaceTab/model'
import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'

export function OuterSpaceTabView() {
   const {
      activateConstellationBounds,
      deactivateConstellationBounds,
      activateConstellationFigures,
      deactivateConstellationFigures,
      activateHyptic,
      deactivateHyptic,
   } = OuterSpaceTabController()

   const {
      constellationBoundsActivated,
      constellationFiguresActivated,
      hypticActivated,
   } = useOuterSpaceTab()

   return (
      <div className="flex flex-col w-full">
         <SwitchTitled
            title={'Activate Constellation bounds'}
            defaultChecked={constellationBoundsActivated}
            onCheck={activateConstellationBounds}
            onUncheck={deactivateConstellationBounds}
         />
         <SwitchTitled
            title={'Activate Constellation figures'}
            defaultChecked={constellationFiguresActivated}
            onCheck={activateConstellationFigures}
            onUncheck={deactivateConstellationFigures}
         />
         <SwitchTitled
            title={'Activate the bright star (Hipparcos and Tycho)'}
            defaultChecked={hypticActivated}
            onCheck={activateHyptic}
            onUncheck={deactivateHyptic}
         />
      </div>
   )
}
