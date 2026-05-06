'use client'
import React, { useCallback } from 'react'
import { TAB_TITLES } from '@/app/constants/strings'
import { TabType } from '@/app/enums/tabType'
import { SettingsDashboardController } from '@/app/components/organisms/settingsDashboard/settingsDashboard.controller'
import { Tabs } from '@/app/components/atoms/ui/tabs'
import { CloseIcon } from '@nextui-org/shared-icons'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
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
import {
   PlanesTabView,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/planesTab/planesTab.view'
import {
   EarthquakesTabView,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/earthquakesTab/earthquakesTab.view'

export function SettingsDashboardView() {
   const { activeSettingsDashboardTab, isSettingsDashboardOpen, handleSettingsOpenChange } =
      useSettingsDashboard()

   const { onTabSelection } = SettingsDashboardController()

   const handleSettingsClose = useCallback((): void => {
      handleSettingsOpenChange(false)
   }, [handleSettingsOpenChange])

   const renderTab = React.useCallback(() => {
      switch (activeSettingsDashboardTab) {
         case TabType.PLANES:
            return <PlanesTabView />
         case TabType.AIRPORTS:
            return <AirportsTabView />
         case TabType.VESSELS:
            return <VesselsTabView />
         case TabType.EARTHQUAKES:
            return <EarthquakesTabView />
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
                  <DrawerHeader className="flex justify-between items-center pt-0">
                     <div>
                        <DrawerTitle>⚙️ Settings</DrawerTitle>
                        <DrawerDescription className="sr-only">Configure application settings and display preferences.</DrawerDescription>
                     </div>
                     <DrawerClose asChild>
                        <Button
                           variant="bordered"
                           isIconOnly
                           size="sm"
                           aria-label="Close"
                           onPress={handleSettingsClose}
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
