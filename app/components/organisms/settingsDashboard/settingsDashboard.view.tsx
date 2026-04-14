'use client'
import React, { useCallback } from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { TAB_TITLES } from '@/app/constants/strings'
import { TabType } from '@/app/enums/tabType'
import { SettingsDashboardController } from '@/app/components/organisms/settingsDashboard/settingsDashboard.controller'
import { Tabs } from '@/app/components/atoms/ui/tabs/tabs'
import { CloseIcon } from '@nextui-org/shared-icons'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import { Button } from '@nextui-org/react'
import { useSettingsDashboard } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'
import {
   AirportsTabView,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/airportsTab/airportsTab.view'
import {
   VesselsTabView,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/vesselsTab/vesselsTab.view'
import { MapTabView } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.view'
import {
   OuterSpaceTabView,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/outerSpaceTab/outerSpaceTab.view'
import {
   CountriesTabView,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/countriesTab/countriesTab.view'
import {
   SettingsDashboardTabsExecuteDefaultValues,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/settingsDashboardTabsExecuteDefaultValues'
import {
   SolarSystemTabView,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/solarSystemTab/solarSystemTab.view'

export function SettingsDashboardView() {
   const { activeSettingsDashboardTab, isSettingsDashboardOpen, setIsSettingsDashboardOpen } =
      useSettingsDashboard()

   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const { onTabSelection } = SettingsDashboardController()

   const renderTab = React.useCallback(() => {
      switch (activeSettingsDashboardTab) {
         case TabType.PLANES:
            // TODO Planes Tab View
            return <></>
         case TabType.AIRPORTS:
            return <AirportsTabView />
         case TabType.VESSELS:
            return <VesselsTabView />
         case TabType.MAP:
            return <MapTabView />
         case TabType.OUTER_SPACE:
            return <OuterSpaceTabView />
         case TabType.COUNTRIES:
            return <CountriesTabView />
         case TabType.SOLAR_SYSTEM:
            return <SolarSystemTabView />
      }
   }, [activeSettingsDashboardTab])

   const restoreMainUi = useCallback((): void => {
      setIsNavBarDisplayed(true)
      setIsSearchBarDisplayed(true)
   }, [setIsNavBarDisplayed, setIsSearchBarDisplayed])

   const handleSettingsOpenChange = useCallback((isOpen: boolean): void => {
      setIsSettingsDashboardOpen(isOpen)

      if (!isOpen) {
         restoreMainUi()
      }
   }, [setIsSettingsDashboardOpen, restoreMainUi])

   const handleSettingsClose = useCallback((): void => {
      handleSettingsOpenChange(false)
   }, [handleSettingsOpenChange])

   const handleTabSelection = useCallback((tabIndex: number): void => {
      onTabSelection(tabIndex as TabType)
   }, [onTabSelection])

   if (!isSettingsDashboardOpen) {
      return null
   }
   
   return (
      <>
         <SettingsDashboardTabsExecuteDefaultValues />
         <Drawer
            dismissible
            onOpenChange={handleSettingsOpenChange}
            open={isSettingsDashboardOpen}
            onClose={handleSettingsClose}>
            <DrawerContent
               onInteractOutside={(event): void => {
                  handleSettingsClose()
                  event.stopPropagation()
                  event.preventDefault()
               }}
            >
               <div className="mx-auto w-full">
                  <DrawerHeader className="flex justify-between items-center">
                     <div>
                        <DrawerTitle>⚙️ Settings</DrawerTitle>
                     </div>
                     <DrawerClose asChild>
                        <Button
                           variant="bordered"
                           isIconOnly
                           size="sm"
                           aria-label="Close"
                           onClick={handleSettingsClose}
                           className="absolute top-4 right-4"
                        >
                           <CloseIcon />
                        </Button>
                     </DrawerClose>
                  </DrawerHeader>
                  <div className="px-8 pb-6 flex flex-row gap-6 max-h-[45vh] min-h-[45vh]">
                     <Tabs
                        selectedTabIndex={activeSettingsDashboardTab}
                        tabTitles={TAB_TITLES}
                        className="shrink-0"
                        onTabSelect={handleTabSelection}
                     />

                     <div className="flex-1 overflow-auto min-w-0 pr-2">
                        {renderTab()}
                     </div>
                  </div>
               </div>
            </DrawerContent>
         </Drawer>
      </>
   )
}
