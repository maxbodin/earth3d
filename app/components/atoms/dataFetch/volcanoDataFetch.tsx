import { useEffect, useRef } from 'react'
import { fetchVolcanoData } from '@/app/server/services/volcanoDataService'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { useVolcanoesTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.model'
import { useVolcanoes } from '@/app/components/atoms/three/volcanoes/volcanoes.model'
import { computeFieldBounds } from '@/lib/math/computeFieldBounds'

export function VolcanoDataFetch(): null {
   const { setVolcanoData, setEruptionData } = useVolcanoes()
   const { displayedSceneData } = useScenes()
   const { volcanoesActivated, initYearRange } = useVolcanoesTab()
   const fetchedRef = useRef(false)

   useEffect(() => {
      let cancelled = false

      if (!volcanoesActivated) {
         setVolcanoData([])
         setEruptionData([])
         fetchedRef.current = false
         return (): void => { cancelled = true }
      }

      if (fetchedRef.current) return

      const fetchAndStore = async (): Promise<void> => {
         if (displayedSceneData?.type === SceneType.SOLAR_SYSTEM) return

         try {
            const response = await fetchVolcanoData()

            if (!cancelled) {
               setVolcanoData(response.items)
               setEruptionData(response.eruptions)
               fetchedRef.current = true

               const bounds = computeFieldBounds(response.eruptions, e => e.year)
               if (bounds) {
                  initYearRange(bounds.min, bounds.max)
               }
            }
         } catch (error) {
            console.error('VolcanoDataFetch failed:', error)
         }
      }

      void fetchAndStore()

      return (): void => {
         cancelled = true
      }
   }, [displayedSceneData, volcanoesActivated, setVolcanoData, setEruptionData, initYearRange])

   return null
}
