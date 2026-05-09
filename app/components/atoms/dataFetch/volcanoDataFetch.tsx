import { useEffect, useRef } from 'react'
import { fetchVolcanoData } from '@/app/server/services/volcanoDataService'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { useVolcanoesTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.model'
import { useVolcanoes } from '@/app/components/atoms/three/volcanoes/volcanoes.model'

export function VolcanoDataFetch(): null {
   const { setVolcanoData } = useVolcanoes()
   const { displayedSceneData } = useScenes()
   const { volcanoesActivated } = useVolcanoesTab()
   const fetchedRef = useRef(false)

   useEffect(() => {
      let cancelled = false

      if (!volcanoesActivated) {
         setVolcanoData([])
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
               fetchedRef.current = true
            }
         } catch (error) {
            console.error('VolcanoDataFetch failed:', error)
         }
      }

      void fetchAndStore()

      return (): void => {
         cancelled = true
      }
   }, [displayedSceneData, volcanoesActivated, setVolcanoData])

   return null
}
