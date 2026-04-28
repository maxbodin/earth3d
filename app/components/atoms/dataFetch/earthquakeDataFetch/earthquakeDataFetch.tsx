import { useEffect } from 'react'
import { fetchEarthquakeData } from '@/app/server/services/earthquakeDataService'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import {
   useEarthquakesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/earthquakesTab/earthquakesTab.model'
import { useEarthquakes, } from '@/app/components/atoms/three/earthquakes/earthquakes.model'
import { EARTHQUAKE_FETCH_INTERVAL_MS, MAX_DISPLAYED_EARTHQUAKES } from '@/app/constants/numbers'
import { EarthquakeQueryParams } from '@/app/types/earthquake/earthquakeQueryParams'
import { getTimeRangeStartIso } from '@/lib/getTimeRangeStartIso'

export function EarthquakeDataFetch(): null {
   const { setEarthquakeData } = useEarthquakes()
   const { displayedSceneData } = useScenes()
   const { earthquakesActivated, earthquakeMinMagnitude, earthquakeTimeRange } = useEarthquakesTab()

   useEffect(() => {
      let cancelled = false

      if (!earthquakesActivated) {
         setEarthquakeData([])
         return (): void => { cancelled = true }
      }

      const fetchAndStore = async (): Promise<void> => {
         if (document.visibilityState !== 'visible') return
         if (displayedSceneData?.type === SceneType.SOLAR_SYSTEM) return

         try {
            const params: EarthquakeQueryParams = {
               starttime: getTimeRangeStartIso(earthquakeTimeRange),
               minmagnitude: earthquakeMinMagnitude,
               orderby: 'time',
               limit: MAX_DISPLAYED_EARTHQUAKES,
            }

            const response = await fetchEarthquakeData(params)

            if (!cancelled) {
               setEarthquakeData(response.features)
            }
         } catch (error) {
            console.error('EarthquakeDataFetch failed:', error)
         }
      }

      void fetchAndStore()

      const intervalId = window.setInterval(() => {
         void fetchAndStore()
      }, EARTHQUAKE_FETCH_INTERVAL_MS)

      const onVisibilityChange = (): void => {
         if (document.visibilityState === 'visible') {
            void fetchAndStore()
         }
      }

      document.addEventListener('visibilitychange', onVisibilityChange)

      return (): void => {
         cancelled = true
         window.clearInterval(intervalId)
         document.removeEventListener('visibilitychange', onVisibilityChange)
      }
   }, [displayedSceneData, earthquakesActivated, earthquakeMinMagnitude, earthquakeTimeRange, setEarthquakeData])

   return null
}
