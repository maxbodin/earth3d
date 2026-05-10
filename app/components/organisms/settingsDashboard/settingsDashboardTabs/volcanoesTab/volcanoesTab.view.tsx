import { SwitchTitled } from '@/app/components/atoms/ui/switchTitled'
import {
   useVolcanoesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.model'
import {
   VolcanoesTabController,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.controller'
import { useVolcanoes } from '@/app/components/atoms/three/volcanoes/volcanoes.model'
import { useCallback, useMemo } from 'react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { Volcano } from '@/app/types/volcano/volcano'
import { Eruption } from '@/app/types/volcano/eruption'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { ObjectType } from '@/app/enums/objectType'
import { useSettingsDashboard } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'
import {
   VolcanoTable,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoTable'
import {
   EruptionTable,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/eruptionTable'
import { Slider } from '@/shadcn/ui/slider'

export function VolcanoesTabView() {
   const {
      volcanoesActivated,
      volcanoHeatmapEnabled,
      eruptionYearMin,
      eruptionYearMax,
      eruptionYearRangeMin,
      eruptionYearRangeMax,
      setEruptionYearRange,
   } = useVolcanoesTab()

   const { volcanoData, eruptionData, setSelectedVolcano } = useVolcanoes()

   const { activateVolcanoes, deactivateVolcanoes, enableHeatmap, disableHeatmap } = VolcanoesTabController()
   const { flyToCoordinates } = CameraFlyController()
   const { setSelectedObjectData, setSelectedObjectType } = useSelection()
   const { handleSettingsOpenChange } = useSettingsDashboard()

   const focusOnVolcano = useCallback((volcano: Volcano): void => {
      setSelectedVolcano(volcano)
      setSelectedObjectData(volcano)
      setSelectedObjectType(ObjectType.VOLCANO)
      flyToCoordinates(volcano.latitude, volcano.longitude)
      handleSettingsOpenChange(false)
   }, [flyToCoordinates, setSelectedVolcano, setSelectedObjectData, setSelectedObjectType, handleSettingsOpenChange])

   const focusOnEruption = useCallback((eruption: Eruption): void => {
      flyToCoordinates(eruption.latitude, eruption.longitude)
      handleSettingsOpenChange(false)
   }, [flyToCoordinates, handleSettingsOpenChange])

   const filteredVolcanoes = useMemo(() => {
      if (volcanoData.length === 0) return []
      return volcanoData.filter(v => {
         if (v.lastEruptionYear == null) return true
         return v.lastEruptionYear >= eruptionYearMin && v.lastEruptionYear <= eruptionYearMax
      })
   }, [volcanoData, eruptionYearMin, eruptionYearMax])

   const filteredEruptions = useMemo(() => {
      if (eruptionData.length === 0) return []
      return eruptionData.filter(e => {
         if (e.year == null) return false
         return e.year >= eruptionYearMin && e.year <= eruptionYearMax
      })
   }, [eruptionData, eruptionYearMin, eruptionYearMax])

   const handleYearRangeChange = useCallback((values: number[]): void => {
      setEruptionYearRange([values[0], values[1]])
   }, [setEruptionYearRange])

   return (
      <div className="flex flex-col w-full gap-2">
         <SwitchTitled
            title={'Activate volcanoes on Map'}
            defaultChecked={volcanoesActivated}
            onCheck={activateVolcanoes}
            onUncheck={deactivateVolcanoes}
         />

         {volcanoesActivated && (
            <div className="flex flex-col gap-4">
               <div className="text-sm text-white/70">
                  Volcanoes loaded: {volcanoData.length.toLocaleString()} · Eruptions loaded: {eruptionData.length.toLocaleString()}
               </div>

               {/* Eruption Year Range */}
               <div className="flex flex-col gap-2 border border-white/20 rounded-lg p-3">
                  <div className="text-sm text-white/90 font-medium">Eruption Year Range</div>
                  <Slider
                     min={eruptionYearRangeMin}
                     max={eruptionYearRangeMax}
                     step={1}
                     value={[eruptionYearMin, eruptionYearMax]}
                     onValueChange={handleYearRangeChange}
                  />
                  <div className="flex justify-between text-xs text-white/50">
                     <span>{eruptionYearMin}</span>
                     <span>{filteredEruptions.length.toLocaleString()} eruptions</span>
                     <span>{eruptionYearMax}</span>
                  </div>
               </div>

               {/* Volcanoes Table */}
               {filteredVolcanoes.length > 0 && (
                  <>
                     <div className="text-sm text-white/90 font-medium">
                        Volcanoes ({filteredVolcanoes.length.toLocaleString()})
                     </div>
                     <VolcanoTable
                        volcanoData={filteredVolcanoes}
                        onFocusVolcano={focusOnVolcano}
                     />
                  </>
               )}

               {/* Eruptions Heatmap */}
               <SwitchTitled
                  title={'Show Eruptions Heatmap'}
                  defaultChecked={volcanoHeatmapEnabled}
                  onCheck={enableHeatmap}
                  onUncheck={disableHeatmap}
               />

               {/* Eruptions Table */}
               {filteredEruptions.length > 0 && (
                  <>
                     <div className="text-sm text-white/90 font-medium">
                        Eruptions ({filteredEruptions.length.toLocaleString()})
                     </div>
                     <EruptionTable
                        eruptionData={filteredEruptions}
                        onFocusEruption={focusOnEruption}
                     />
                  </>
               )}
            </div>
         )}
      </div>
   )
}
