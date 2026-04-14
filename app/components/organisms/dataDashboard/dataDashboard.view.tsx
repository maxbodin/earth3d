'use client'
import React, { useCallback } from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'

import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import { Button } from '@nextui-org/react'
import { CloseIcon } from '@nextui-org/shared-icons'
import { useDataDashboard } from '@/app/components/organisms/dataDashboard/dataDashboard.model'


export function DataDashboardView() {
   const { isDataDashboardOpen, setIsDataDashboardOpen } =
      useDataDashboard()

   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const restoreMainUi = useCallback((): void => {
      setIsNavBarDisplayed(true)
      setIsSearchBarDisplayed(true)
   }, [setIsNavBarDisplayed, setIsSearchBarDisplayed])

   const handleDataDashboardOpenChange = useCallback((isOpen: boolean): void => {
      setIsDataDashboardOpen(isOpen)

      if (!isOpen) {
         restoreMainUi()
      }
   }, [setIsDataDashboardOpen, restoreMainUi])

   const handleDataDashboardClose = useCallback((): void => {
      handleDataDashboardOpenChange(false)
   }, [handleDataDashboardOpenChange])

   if (!isDataDashboardOpen) {
      return null
   }

   return (
      <Drawer
         dismissible
         onOpenChange={handleDataDashboardOpenChange}
         open={isDataDashboardOpen}
         onClose={handleDataDashboardClose}>
         <DrawerContent
            onInteractOutside={(event): void => {
               handleDataDashboardClose()
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
                        onClick={handleDataDashboardClose}
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