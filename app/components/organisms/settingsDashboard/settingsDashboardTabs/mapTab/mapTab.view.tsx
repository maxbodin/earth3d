import { MapStyleCard } from '@/app/components/atoms/ui/mapStyleCard'
import {
   useMapTabController
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.controller'

export function MapTabView() {
   const { activeMapStyleId, selectMapStyle, mapStyleSections } = useMapTabController()

   return (
      <div className="flex w-full flex-col gap-6 overflow-y-auto p-4">
         {mapStyleSections.map((section) => (
            <section key={section.title}>
               <p className="mb-2 text-sm font-semibold uppercase text-white/45">
                  {section.title}
               </p>
               <div className="grid grid-cols-4 gap-2 md:grid-cols-5 xl:grid-cols-6 p-2">
                  {section.options.map((option) => (
                     <MapStyleCard
                        key={option.id}
                        option={option}
                        isSelected={activeMapStyleId === option.id}
                        onSelect={() => selectMapStyle(option.id)}
                     />
                  ))}
               </div>
            </section>
         ))}
      </div>
   )
}
