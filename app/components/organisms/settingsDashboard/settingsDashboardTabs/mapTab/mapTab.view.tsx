import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled/switchTitled'
import { useMapTabController } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.controller'

export function MapTabView() {
   const {
      activeMapStyleId,
      activateMapStyle,
      deactivateMapStyle,
      mapStyleSections,
   } = useMapTabController()

   return (
      <div className="flex w-full flex-col gap-8">
         {mapStyleSections.map((section) => (
            <section key={section.title} className="flex flex-col gap-2">
               <div className="px-8 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/45">
                  {section.title}
               </div>
               {section.options.map((option) => (
                  <SwitchTitled
                     key={option.id}
                     title={option.title}
                     defaultChecked={activeMapStyleId === option.id}
                     onCheck={() => activateMapStyle(option.id)}
                     onUncheck={() => deactivateMapStyle(option.fallbackStyleId)}
                  />
               ))}
            </section>
         ))}
      </div>
   )
}
