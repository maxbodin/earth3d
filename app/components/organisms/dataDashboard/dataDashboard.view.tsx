'use client'
import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'

import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import { Button } from '@nextui-org/react'
import { CloseIcon } from '@nextui-org/shared-icons'
import { useDataDashboard } from '@/app/components/organisms/dataDashboard/dataDashboard.model'


export function DataDashboardView() {
   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const { isDataDashboardOpen, setIsDataDashboardOpen } =
      useDataDashboard()

   return (
      <Drawer
         dismissible={false}
         onOpenChange={setIsDataDashboardOpen}
         open={isDataDashboardOpen}
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
                     <DrawerTitle>📊 Analyze Earth data</DrawerTitle>
                  </div>
                  <DrawerClose asChild>
                     <Button
                        variant="bordered"
                        isIconOnly
                        size="sm"
                        aria-label="Close"
                        onClick={(): void => {
                           setIsDataDashboardOpen(false)
                        }}
                        className="absolute top-4 right-4"
                     >
                        <CloseIcon />
                     </Button>
                  </DrawerClose>
               </DrawerHeader>
               <div className="px-8 overflow-auto max-h-[45vh] min-h-[45vh]">
               </div>
            </div>
         </DrawerContent>
      </Drawer>
   )
}