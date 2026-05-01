import { MapStyleCard } from '@/app/components/atoms/ui/mapStyleCard'
import {
   useMapTabController
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.controller'
import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled'
import { Slider } from '@/app/components/atoms/ui/slider'
import { useMapTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.model'

export function MapTabView() {
   const { activeMapStyleId, selectMapStyle, mapStyleSections } = useMapTabController()
   const {
      tectonicPlatesEnabled, setTectonicPlatesEnabled, 
      tectonicPlatesOpacity, setTectonicPlatesOpacity,
      debugTilesEnabled, setDebugTilesEnabled, 
      debugTilesOpacity, setDebugTilesOpacity,
   } = useMapTab()

   return (
      <div className="flex w-full flex-col gap-6 overflow-y-auto p-4">
         <section>
            <p className="mb-2 text-sm font-semibold uppercase text-white/45">
               Overlays
            </p>
            <SwitchTitled
               title={'Show Tectonic Plates'}
               defaultChecked={tectonicPlatesEnabled}
               onCheck={() => setTectonicPlatesEnabled(true)}
               onUncheck={() => setTectonicPlatesEnabled(false)}
            />
            {tectonicPlatesEnabled && (
               <Slider
                  title="Opacity"
                  value={tectonicPlatesOpacity}
                  onChange={setTectonicPlatesOpacity}
               />
            )}
            <SwitchTitled
               title={'Show Debug Tiles'}
               defaultChecked={debugTilesEnabled}
               onCheck={() => setDebugTilesEnabled(true)}
               onUncheck={() => setDebugTilesEnabled(false)}
            />
            {debugTilesEnabled && (
               <Slider
                  title="Opacity"
                  value={debugTilesOpacity}
                  onChange={setDebugTilesOpacity}
               />
            )}
         </section>

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
