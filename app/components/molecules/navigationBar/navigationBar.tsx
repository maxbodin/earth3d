import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { FadeInOut } from '@/app/components/atoms/ui/fadeInOut/fadeInOut'
import './styles.css'
import { PanelType } from '@/app/enums/panelType'
import { useCredit } from '@/app/components/organisms/credit/credit.model'
import { Button, ButtonGroup, Tooltip } from '@nextui-org/react'
import { PinIcon } from '@/app/components/icons/pinIcon'
import { DashboardIcon } from '@/app/components/icons/dashboardIcon'
import { CreditIcon } from '@/app/components/icons/creditIcon'
import { DataIcon } from '@/app/components/icons/dataIcon'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { useDataDashboard } from '@/app/components/organisms/dataDashboard/dataDashboard.model'
import { useSettingsDashboard } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'
import { GithubIcon, ShuffleIcon } from 'lucide-react'
import Link from 'next/link'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { GeocodeResponse } from '@/app/types/orsTypes'
import { reverse } from '@/app/server/services/openRouteService'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { ObjectType } from '@/app/enums/objectType'

export function NavigationBar() {
   const {
      setIsNavBarDisplayed,
      isNavBarDisplayed,
      setIsSearchBarDisplayed,
      setOpenedPanelType,
      openedPanelType,
   } = useUi()

   const { setIsSettingsDashboardOpen } = useSettingsDashboard()
   const { setIsCreditOpen } = useCredit()
   const { setIsMarkersDashboardOpen } = useMarkersDashboard()
   const { setIsDataDashboardOpen } = useDataDashboard()

   const { flyToCoordinates } = CameraFlyController()
   const { setSelectedObjectType, setSelectedObjectData } = useSelection()

   const openMarkers = (): void => {
      setIsNavBarDisplayed(false)
      setOpenedPanelType(PanelType.MARKERS)
   }

   const openDashboard = (): void => {
      setIsNavBarDisplayed(false)
      setOpenedPanelType(PanelType.DASHBOARD)
   }

   const openCredit = (): void => {
      setIsNavBarDisplayed(false)
      setOpenedPanelType(PanelType.CREDIT)
   }

   const openData = (): void => {
      setIsNavBarDisplayed(false)
      setOpenedPanelType(PanelType.DATA)
   }


   /**
    * TODO : Refactor in the right file.
    */
   const getRandomPlace = async (): Promise<void> => {
      const randomLatitude: number = Math.random() * 180 - 90  // Random latitude between -90 and 90.
      const randomLongitude: number = Math.random() * 360 - 180 // Random longitude between -180 and 180.

      try {
         // Call server-side function.
         const data: GeocodeResponse = await reverse(randomLongitude, randomLatitude)

         // Display place data.
         setSelectedObjectData(data.features[0])
         setSelectedObjectType(ObjectType.PLACE)

         flyToCoordinates(
            randomLatitude,
            randomLongitude,
         )

      } catch (err) {
         // TODO : Signaler l'erreur.
      }
   }

   return (
      <>
         <FadeInOut
            isVisible={isNavBarDisplayed}
            preFadeOutCallback={(): void => {
               setIsSearchBarDisplayed(false)

               switch (openedPanelType) {
                  case PanelType.NULL:
                     break
                  case PanelType.MARKERS:
                     setIsMarkersDashboardOpen(true)
                     break
                  case PanelType.DASHBOARD:
                     setIsSettingsDashboardOpen(true)
                     break
                  case PanelType.CREDIT:
                     setIsCreditOpen(true)
                     break
                  case PanelType.DATA:
                     setIsDataDashboardOpen(true)
                     break
               }
            }}
         >
            <div
               className="flex flex-row navbaricons absolute right-10 p-4 transform bottom-10 z-40">
               <ButtonGroup variant="bordered"
                            className="rounded-2xl bg-white/10 bg-opacity-10 backdrop-blur-md drop-shadow-lg">
                  <Tooltip content="Open Markers">
                     <Button size="lg" isIconOnly variant="bordered" aria-label="Open Markers"
                             onClick={openMarkers}>
                        <PinIcon />
                     </Button>
                  </Tooltip>
                  <Tooltip content="Open Settings">
                     <Button size="lg" isIconOnly variant="bordered" aria-label="Open Settings" onClick={openDashboard}>
                        <DashboardIcon />
                     </Button>
                  </Tooltip>
                  <Tooltip content="Open Data">
                     <Button size="lg" isIconOnly variant="bordered" aria-label="Open Data" onClick={openData}>
                        <DataIcon />
                     </Button>
                  </Tooltip>
                  <Tooltip content="Open Credit">
                     <Button size="lg" isIconOnly variant="bordered" aria-label="Open Credit" onClick={openCredit}>
                        <CreditIcon />
                     </Button>
                  </Tooltip>
                  <Tooltip content="Random Place">
                     <Button size="lg" isIconOnly variant="bordered" aria-label="Random Place"
                             onClick={getRandomPlace}>
                        <ShuffleIcon />
                     </Button>
                  </Tooltip>
               </ButtonGroup>
               <div className="pl-4">
                  <Tooltip content="GitHub Project">
                     <Button size="lg" isIconOnly variant="bordered" aria-label="Open GitHub Project"
                             as={Link}
                             className="bg-black"
                             href={'https://github.com/maxbodin/earth3d'}>
                        <GithubIcon />
                     </Button>
                  </Tooltip>
               </div>
            </div>
         </FadeInOut>
      </>
   )
}
