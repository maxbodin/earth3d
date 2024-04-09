import React from 'react'
import { useUi } from '@/app/context/UIContext'
import { DashboardController } from '@/app/components/organisms/dashboard/controller'
import { useDashboard } from '@/app/components/organisms/dashboard/model'
import { GlassCard } from '@/app/components/molecules/glassCard/glassCard'
import { Tabs } from '@/app/components/atoms/ui/tabs/tabs'
import { TAB_TITLES } from '@/app/constants/strings'
import { TabType } from '@/app/components/enums/tabType'
import { VesselsTabView } from '@/app/components/organisms/dashboardTabs/vesselsTab/view'
import { MapTabView } from '@/app/components/organisms/dashboardTabs/mapTab/view'
import { OuterSpaceTabView } from '@/app/components/organisms/dashboardTabs/outerSpaceTab/view'

export function DashboardView() {
   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const { activeDashboardTab, isDashboardOpen, setIsDashboardOpen } =
      useDashboard()

   const { onTabSelection } = DashboardController()

   return (
      <>
         <GlassCard
            FadeInOut_isVisible={isDashboardOpen}
            FadeInOut_preFadeOutCallback={(): void => {
               setIsNavBarDisplayed(true)
               setIsSearchBarDisplayed(true)
            }}
            centered={true}
            content={
               <>
                  <Tabs tabTitles={TAB_TITLES} onTabClick={onTabSelection} />

                  {activeDashboardTab == TabType.AIRPORTS && <div>TODO</div>}
                  {activeDashboardTab == TabType.PLANES && <div>TODO</div>}
                  {activeDashboardTab == TabType.VESSELS && <VesselsTabView />}
                  {activeDashboardTab == TabType.MAP && <MapTabView />}
                  {activeDashboardTab == TabType.OUTER_SPACE && (
                     <OuterSpaceTabView />
                  )}
               </>
            }
            onClose={(): void => {
               setIsDashboardOpen(false)
            }}
         />
      </>
   )
}
