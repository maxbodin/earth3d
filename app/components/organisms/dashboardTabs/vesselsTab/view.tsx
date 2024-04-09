import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'
import { useVesselsTab } from '@/app/components/organisms/dashboardTabs/vesselsTab/model'
import { VesselsTabController } from '@/app/components/organisms/dashboardTabs/vesselsTab/controller'

export function VesselsTabView() {
   const { activateVessels, deactivateVessels } = VesselsTabController()

   const { vesselsActivated } = useVesselsTab()

   return (
      <div className="p-4">
         <SwitchTitled
            title={'Activate Vessels'}
            defaultChecked={vesselsActivated}
            onCheck={activateVessels}
            onUncheck={deactivateVessels}
         />
      </div>
   )
}
