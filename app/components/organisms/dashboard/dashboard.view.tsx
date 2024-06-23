'use client'
import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { DashboardController } from '@/app/components/organisms/dashboard/dashboard.controller'
import { useDashboard } from '@/app/components/organisms/dashboard/dashboard.model'
import { GlassCard } from '@/app/components/molecules/glassCard/glassCard'
import { Tabs } from '@/app/components/atoms/ui/tabs/tabs'
import { TAB_TITLES } from '@/app/constants/strings'
import { TabType } from '@/app/enums/tabType'
import { VesselsTabView } from '@/app/components/organisms/dashboardTabs/vesselsTab/vesselsTab.view'
import { MapTabView } from '@/app/components/organisms/dashboardTabs/mapTab/mapTab.view'
import { OuterSpaceTabView } from '@/app/components/organisms/dashboardTabs/outerSpaceTab/view'
import { CountriesTabView } from '@/app/components/organisms/dashboardTabs/countriesTab/countriesTab.view'
import { AirportsTabView } from '@/app/components/organisms/dashboardTabs/airportsTab/airportsTab.view'

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

                  {activeDashboardTab == TabType.AIRPORTS && (
                     <AirportsTabView />
                  )}
                  {activeDashboardTab == TabType.PLANES && (
                     <div>Work In Progress</div>
                  )}
                  {activeDashboardTab == TabType.VESSELS && <VesselsTabView />}
                  {activeDashboardTab == TabType.MAP && <MapTabView />}
                  {activeDashboardTab == TabType.OUTER_SPACE && (
                     <OuterSpaceTabView />
                  )}
                  {activeDashboardTab == TabType.COUNTRIES && (
                     <CountriesTabView />
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
