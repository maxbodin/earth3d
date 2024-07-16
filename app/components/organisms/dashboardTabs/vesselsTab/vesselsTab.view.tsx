import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'
import { useVesselsTab } from '@/app/components/organisms/dashboardTabs/vesselsTab/vesselsTab.model'
import { VesselsTabController } from '@/app/components/organisms/dashboardTabs/vesselsTab/vesselsTab.controller'

export function VesselsTabView() {
   const { activateVessels, deactivateVessels } = VesselsTabController()

   const { vesselsActivated } = useVesselsTab()

   return (
      <div className="flex flex-col">
         <SwitchTitled
            title={'Activate Vessels'}
            defaultChecked={vesselsActivated}
            onCheck={activateVessels}
            onUncheck={deactivateVessels}
         />
      </div>
   )
}
