'use client'
import React, { useEffect } from 'react'
import { useAstresList } from '@/app/components/organisms/astresList/astresList.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { astres } from '@/app/data/astres'
import { CleanTabs } from '@/app/components/atoms/ui/tabs/cleanTabs'
import { Astre } from '@/app/types/astre'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'

export function AstresListView() {
   const { selectedAstre, setSelectedAstre } = useAstresList()
   const { displayedSceneData } = useScenes()
   const { flyToAstre } = CameraFlyController()

   useEffect((): void => {
      flyToAstre(selectedAstre)
   }, [selectedAstre])

   return (
      <>
         {displayedSceneData && displayedSceneData.type === SceneType.SOLAR_SYSTEM && <div
            className="absolute transform bottom-10 left-10 p-4 z-40"
         ><CleanTabs
            tabTitles={astres.map((astre: Astre) => astre.name)}
            onTabClick={(astreName: string): void => {
               const selected: Astre | undefined = astres.find((astre: Astre): boolean => astre.name === astreName)
               if (selected) {
                  setSelectedAstre(selected)
               }
            }}
         />
         </div>}
      </>
   )
}
