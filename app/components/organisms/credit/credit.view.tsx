import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { Tabs } from '../../atoms/ui/tabs/tabs'
import { CreditController } from '@/app/components/organisms/credit/credit.controller'
import { useCredit } from '@/app/components/organisms/credit/credit.model'
import { TabType } from '@/app/enums/tabType'
import { TAB_TITLES } from '@/app/constants/strings'
import { GlassCard } from '@/app/components/molecules/glassCard/glassCard'

export function CreditView() {
   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const { activeCreditTab, isCreditOpen, setIsCreditOpen } = useCredit()

   const { onTabSelection } = CreditController()

   return (
      <>
         <GlassCard
            FadeInOut_isVisible={isCreditOpen}
            FadeInOut_preFadeOutCallback={(): void => {
               setIsNavBarDisplayed(true)
               setIsSearchBarDisplayed(true)
            }}
            centered={true}
            content={
               <>
                  <Tabs tabTitles={TAB_TITLES} onTabClick={onTabSelection} />

                  {activeCreditTab == TabType.AIRPORTS && (
                     <div>Work In Progress</div>
                  )}
                  {activeCreditTab == TabType.PLANES && (
                     <div>Work In Progress</div>
                  )}
                  {activeCreditTab == TabType.VESSELS && (
                     <div>Work In Progress</div>
                  )}
                  {activeCreditTab == TabType.MAP && (
                     <div>Work In Progress</div>
                  )}
                  {activeCreditTab == TabType.OUTER_SPACE && (
                     <div>Work In Progress</div>
                  )}
                  {activeCreditTab == TabType.COUNTRIES && (
                     <div>Work In Progress</div>
                  )}
               </>
            }
            onClose={(): void => {
               setIsCreditOpen(false)
            }}
         />
      </>
   )
}
