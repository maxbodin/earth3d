import React from 'react'
import { useUi } from '@/app/context/UIContext'
import { Tabs } from '../../atoms/ui/tabs/tabs'
import { CreditController } from '@/app/components/organisms/credit/controller'
import { useCredit } from '@/app/components/organisms/credit/model'
import { TabType } from '@/app/components/enums/tabType'
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

                  {activeCreditTab == TabType.AIRPORTS && <div>TODO</div>}
                  {activeCreditTab == TabType.PLANES && <div>TODO</div>}
                  {activeCreditTab == TabType.VESSELS && <div>TODO</div>}
                  {activeCreditTab == TabType.MAP && <div>TODO</div>}
                  {activeCreditTab == TabType.OUTER_SPACE && <div>TODO</div>}
               </>
            }
            onClose={(): void => {
               setIsCreditOpen(false)
            }}
         />
      </>
   )
}
