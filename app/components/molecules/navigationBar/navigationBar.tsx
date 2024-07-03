import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { FadeInOut } from '@/app/components/atoms/ui/fadeInOut/fadeInOut'
import './styles.css'
import { PanelType } from '@/app/enums/panelType'
import { useDashboard } from '@/app/components/organisms/dashboard/dashboard.model'
import { useCredit } from '@/app/components/organisms/credit/credit.model'
import { Button, ButtonGroup } from '@nextui-org/react'
import { PinIcon } from '@/app/components/icons/pinIcon'
import { DashboardIcon } from '@/app/components/icons/dashboardIcon'
import { CreditIcon } from '@/app/components/icons/creditIcon'
import { DataIcon } from '@/app/components/icons/dataIcon'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'

export function NavigationBar() {
   const {
      setIsNavBarDisplayed,
      isNavBarDisplayed,
      setIsSearchBarDisplayed,
      setOpenedPanelType,
      openedPanelType,
   } = useUi()

   const { setIsDashboardOpen } = useDashboard()
   const { setIsCreditOpen } = useCredit()
   const { setIsMarkersDashboardOpen } = useMarkersDashboard()

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
                     setIsDashboardOpen(true)
                     break
                  case PanelType.CREDIT:
                     setIsCreditOpen(true)
                     break
                  case PanelType.DATA:
                     break
               }
            }}
         >
            <div
               className="navbaricons absolute right-10 p-4 transform bottom-10 z-40">
               <ButtonGroup variant="bordered"
                            className="rounded-2xl bg-white/10 bg-opacity-10 backdrop-blur-md drop-shadow-lg">
                  <Button size="lg" isIconOnly variant="bordered" aria-label="Open Makers Drawer" onClick={openMarkers}>
                     <PinIcon />
                  </Button>
                  <Button size="lg" isIconOnly variant="bordered" aria-label="Open Dashboard" onClick={openDashboard}>
                     <DashboardIcon />
                  </Button>
                  <Button size="lg" isIconOnly variant="bordered" aria-label="Open Credit" onClick={openCredit}>
                     <CreditIcon />
                  </Button>
                  <Button size="lg" isIconOnly variant="bordered" aria-label="Open Data" onClick={openData}>
                     <DataIcon />
                  </Button>
               </ButtonGroup>
            </div>
         </FadeInOut>
      </>
   )
}
