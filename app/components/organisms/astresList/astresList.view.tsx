'use client'
import React, { useEffect } from 'react'
import { useAstresList } from '@/app/components/organisms/astresList/astresList.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { astres } from '@/app/data/astres'
import { CleanTabs } from '@/app/components/atoms/ui/tabs/cleanTabs'
import { Astre } from '@/app/types/astre'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { DatePicker } from '@nextui-org/date-picker'
import { useSolarSystem } from '@/app/components/atoms/three/solarSystem/solarSystem.model'
import { Body } from 'astronomy-engine'

export function AstresListView() {
   const { selectedAstre, setSelectedAstre, selectedDate, setSelectedDate } = useAstresList()
   const { displayedSceneData } = useScenes()
   const { flyToAstre } = CameraFlyController()
   const { trueSize } = useSolarSystem()


   useEffect((): void => {
      flyToAstre(selectedAstre)
   }, [selectedAstre])

   // Filter out the Moon if trueSize is false, so that it does not overlap the earth.
   const filteredAstres: Astre[] = trueSize
      ? astres
      : astres.filter((astre: Astre): boolean => astre.body !== Body.Moon)

   return (
      <>
         {displayedSceneData && displayedSceneData.type === SceneType.SOLAR_SYSTEM &&
            <>
               <div
                  className="absolute transform bottom-10 left-10 p-4 z-40 flex flex-col space-y-4"
               >
                  <DatePicker variant="bordered"
                              className="rounded-2xl bg-white/10 bg-opacity-10 backdrop-blur-md drop-shadow-lg"
                              value={selectedDate} onChange={setSelectedDate} />
                  <CleanTabs
                     selectedTabIndex={filteredAstres.indexOf(selectedAstre)}
                     tabTitles={filteredAstres.map((astre: Astre) => astre.name)}
                     onTabClick={(astreName: string): void => {
                        const selected: Astre | undefined = filteredAstres.find((astre: Astre): boolean => astre.name === astreName)
                        if (selected) {
                           setSelectedAstre(selected)
                        }
                     }}
                  />
               </div>
            </>}
      </>
   )
}
