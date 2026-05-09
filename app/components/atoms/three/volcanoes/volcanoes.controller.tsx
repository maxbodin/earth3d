'use client'
import * as THREE from 'three'
import { useCallback, useEffect } from 'react'
import { useVolcanoes } from '@/app/components/atoms/three/volcanoes/volcanoes.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { VOLCANO_BASE_RADIUS } from '@/app/constants/numbers'
import { VOLCANO_RENDER_ORDER } from '@/app/constants/renderOrder'
import { useVolcanoesTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.model'
import { Volcano } from '@/app/types/volcano/volcano'
import { clearGroup } from '@/lib/three/clearGroup'
import { latLongToVector3 } from '@/lib/geo/latLongToVector3'

// TODO : Refactor in constants.
const SHARED_CONE_GEOMETRY = new THREE.ConeGeometry(1, 2, 3)
const VOLCANO_COLOR = new THREE.Color(0xff4500)

function createVolcanoMarkerMesh(
   volcano: Volcano,
   sceneType: SceneType,
): THREE.Mesh | null {
   const { latitude, longitude } = volcano
   if (latitude == null || longitude == null) return null

   let surfacePosition: THREE.Vector3

   if (sceneType === SceneType.PLANE) {
      const worldPos = ThreeGeoUnitsUtils.datumsToSpherical(latitude, longitude)
      surfacePosition = new THREE.Vector3(worldPos.x, 0, -worldPos.y)
   } else {
      surfacePosition = latLongToVector3(latitude, longitude)
   }

   const material = new THREE.MeshBasicMaterial({
      color: VOLCANO_COLOR,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      depthTest: true,
   })

   const mesh = new THREE.Mesh(SHARED_CONE_GEOMETRY, material)
   mesh.position.copy(surfacePosition)
   mesh.scale.setScalar(VOLCANO_BASE_RADIUS)

   if (sceneType === SceneType.SPHERICAL) {
      mesh.lookAt(new THREE.Vector3(0, 0, 0))
      mesh.rotateX(Math.PI / 2)
   }

   mesh.renderOrder = VOLCANO_RENDER_ORDER
   mesh.userData = { volcanoFeature: volcano }

   return mesh
}

export function VolcanoesController(): null {
   const { volcanoData, displayedVolcanoesGroup } = useVolcanoes()
   const { displayedSceneData } = useScenes()
   const { volcanoesActivated } = useVolcanoesTab()

   const renderVolcanoes = useCallback((): void => {
      const sceneData = displayedSceneData

      if (!volcanoesActivated || sceneData == null || sceneData.type === SceneType.SOLAR_SYSTEM) {
         clearGroup(displayedVolcanoesGroup)
         displayedVolcanoesGroup.parent?.remove(displayedVolcanoesGroup)
         return
      }

      if (displayedVolcanoesGroup.parent !== sceneData.scene) {
         sceneData.scene.add(displayedVolcanoesGroup)
      }

      clearGroup(displayedVolcanoesGroup)

      if (volcanoData.length === 0) return

      for (const volcano of volcanoData) {
         const mesh = createVolcanoMarkerMesh(volcano, sceneData.type)
         if (mesh != null) {
            displayedVolcanoesGroup.add(mesh)
         }
      }
   }, [
      displayedVolcanoesGroup,
      displayedSceneData,
      volcanoesActivated,
      volcanoData,
   ])

   useEffect(() => {
      renderVolcanoes()

      return () => {
         clearGroup(displayedVolcanoesGroup)
         displayedVolcanoesGroup.parent?.remove(displayedVolcanoesGroup)
      }
   }, [displayedVolcanoesGroup, renderVolcanoes])

   return null
}
