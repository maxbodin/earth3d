import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'
import {
   useVesselsTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/vesselsTab/vesselsTab.model'

export function VesselsTabView() {
   const { setVesselsActivated } = useVesselsTab()

   const { vesselsActivated } = useVesselsTab()

   return (
      <div className="flex flex-col w-full">
         <SwitchTitled
            title={'Activate Vessels'}
            defaultChecked={vesselsActivated}
            onCheck={() => setVesselsActivated(true)}
            onUncheck={() => setVesselsActivated(false)}
         />
      </div>
   )
}
