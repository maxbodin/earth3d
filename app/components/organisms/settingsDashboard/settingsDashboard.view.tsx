'use client'
import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { Tabs } from '@/app/components/atoms/ui/tabs/tabs'
import { TAB_TITLES } from '@/app/constants/strings'
import { TabType } from '@/app/enums/tabType'
import { SettingsDashboardController } from '@/app/components/organisms/settingsDashboard/settingsDashboard.controller'
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
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/outerSpaceTab/view'
import {
   CountriesTabView,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/countriesTab/countriesTab.view'
import {
   SettingsDashboardTabsExecuteDefaultValues,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/settingsDashboardTabsExecuteDefaultValues'

export function SettingsDashboardView() {
   const { activeSettingsDashboardTab, isSettingsDashboardOpen, setIsSettingsDashboardOpen } =
      useSettingsDashboard()

   if (!isSettingsDashboardOpen) {
      return null
   }
   
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
      }
   }, [activeSettingsDashboardTab])

   return (
      <>
         <SettingsDashboardTabsExecuteDefaultValues />
         <Drawer
            dismissible={false}
            onOpenChange={setIsSettingsDashboardOpen}
            open={isSettingsDashboardOpen}
            onClose={(): void => {
               setIsNavBarDisplayed(true)
               setIsSearchBarDisplayed(true)
            }}>
            <DrawerContent
               onInteractOutside={(event): void => {
                  setIsNavBarDisplayed(true)
                  setIsSearchBarDisplayed(true)
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
                           onClick={(): void => {
                              setIsSettingsDashboardOpen(false)
                           }}
                           className="absolute top-4 right-4"
                        >
                           <CloseIcon />
                        </Button>
                     </DrawerClose>
                  </DrawerHeader>
                  <div className="px-8 flex flex-row overflow-auto max-h-[45vh] min-h-[45vh]">
                     <Tabs tabTitles={TAB_TITLES} onTabClick={onTabSelection} />
                     {renderTab()}
                  </div>
               </div>
            </DrawerContent>
         </Drawer>
      </>
   )
}
