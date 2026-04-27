import { useEffect } from 'react'
import { fetchPlanesData } from '@/app/server/services/planeDataService'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { clamp } from '@/lib/math/clamp'
import { DEFAULT_BBOX, EARTH_RADIUS } from '@/app/constants/numbers'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'
import { toBoundingBox } from '@/lib/to/toBoundingBox'
import {
   usePlanesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/planesTab/planesTab.model'
import { usePlanes } from '@/app/components/atoms/three/planes/planes.model'

const PLANES_FETCH_INTERVAL_MS = 30_000

function getPlanesBBoxForCurrentView(
   displayedSceneData: ReturnType<typeof useScenes>['displayedSceneData'],
): OpenSkyBoundingBox {
   if (displayedSceneData == null) {
      return DEFAULT_BBOX
   }

   if (displayedSceneData.type === SceneType.PLANE) {
      const target = displayedSceneData.controls.target
      const center = ThreeGeoUnitsUtils.sphericalToDatums(target.x, -target.z)
      const cameraDistance = Math.max(displayedSceneData.controls.getDistance(), 1)

      return toBoundingBox(
         center.latitude,
         center.longitude,
         clamp(cameraDistance / 180000, 2, 8),
         clamp(cameraDistance / 120000, 3, 12),
      )
   }

   if (displayedSceneData.type === SceneType.SPHERICAL) {
      const targetDirection = displayedSceneData.controls.target.clone()
      if (targetDirection.lengthSq() === 0) {
         return DEFAULT_BBOX
      }

      const targetGeo = ThreeGeoUnitsUtils.vectorToDatums(targetDirection.normalize())
      const altitude = Math.max(displayedSceneData.controls.getDistance() - EARTH_RADIUS, 0)

      return toBoundingBox(
         targetGeo.latitude,
         targetGeo.longitude,
         clamp(altitude / 260000, 3, 8),
         clamp(altitude / 180000, 4, 12),
      )
   }

   return DEFAULT_BBOX
}

export function PlaneDataFetch(): null {
   const { setPlanesData, setOpenSkyRemainingTokens } = usePlanes()
   const { displayedSceneData } = useScenes()
   const { planesActivated } = usePlanesTab()

   useEffect(() => {
      let cancelled = false

      if (!planesActivated) {
         setPlanesData([])

         return (): void => {
            cancelled = true
         }
      }

      const fetchAndStorePlanes = async (): Promise<void> => {
         if (document.visibilityState !== 'visible') {
            return
         }

         if (displayedSceneData?.type === SceneType.SOLAR_SYSTEM) {
            return
         }

         try {
            const planesResponse = await fetchPlanesData(
               getPlanesBBoxForCurrentView(displayedSceneData),
            )

            if (!cancelled) {
               setPlanesData(planesResponse.states ?? [])
               setOpenSkyRemainingTokens(planesResponse.meta.remainingTokens)
            }
         } catch (error) {
            console.error('PlaneDataFetch failed:', error)
         }
      }

      void fetchAndStorePlanes()

      const intervalId = window.setInterval(() => {
         void fetchAndStorePlanes()
      }, PLANES_FETCH_INTERVAL_MS)

      const onVisibilityChange = (): void => {
         if (document.visibilityState === 'visible') {
            void fetchAndStorePlanes()
         }
      }

      document.addEventListener('visibilitychange', onVisibilityChange)

      return (): void => {
         cancelled = true
         window.clearInterval(intervalId)
         document.removeEventListener('visibilitychange', onVisibilityChange)
      }
   }, [displayedSceneData, planesActivated, setOpenSkyRemainingTokens, setPlanesData])

   return null
}
