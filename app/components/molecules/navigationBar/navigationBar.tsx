import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { Button } from '../../atoms/ui/button/button'
import { FadeInOut } from '@/app/components/atoms/ui/fadeInOut/fadeInOut'
import { DashboardIcon } from '@/public/svgs/dashboardIcon'
import { CreditIcon } from '@/public/svgs/creditIcon'
import { DataIcon } from '@/public/svgs/dataIcon'
import './styles.css'
import { PanelType } from '@/app/enums/panelType'
import { useDashboard } from '@/app/components/organisms/dashboard/dashboard.model'
import { useCredit } from '@/app/components/organisms/credit/credit.model'

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
               className="navbaricons absolute right-10 p-4 transform bottom-10 z-40 flex items-center rounded-lg bg-white/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5">
               <Button
                  onClick={openDashboard}
                  svg={<DashboardIcon />}
                  message={'Access dashboard'}
               />

               <Button
                  onClick={openCredit}
                  svg={<CreditIcon />}
                  message={'Access credits'}
               />

               <Button
                  onClick={openData}
                  svg={<DataIcon />}
                  message={'Access data'}
               />
            </div>
         </FadeInOut>
      </>
   )
}
