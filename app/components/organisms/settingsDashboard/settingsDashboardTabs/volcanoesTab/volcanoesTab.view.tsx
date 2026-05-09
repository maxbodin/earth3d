import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled'
import {
   useVolcanoesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.model'
import {
   VolcanoesTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.controller'

export function VolcanoesTabView() {
   const { volcanoesActivated } = useVolcanoesTab()

   const { activateVolcanoes, deactivateVolcanoes } = VolcanoesTabController()

   return (
      <div className="flex flex-col w-full">
         <SwitchTitled
            title={'Activate volcanoes on Map'}
            defaultChecked={volcanoesActivated}
            onCheck={activateVolcanoes}
            onUncheck={deactivateVolcanoes}
         />
      </div>
   )
}
