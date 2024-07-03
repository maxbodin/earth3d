'use client'
import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'

import {
   Drawer,
   DrawerClose,
   DrawerContent,
   DrawerDescription,
   DrawerFooter,
   DrawerHeader,
   DrawerTitle,
} from '@/shadcn/ui/drawer'
import { Button, getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { CloseIcon } from '@nextui-org/shared-icons'
import { Marker } from '@/app/types/marker'
import { MarkersDashboardController } from '@/app/components/organisms/markersDashboard/markersDashboard.controller'

const columns: string[] = ['Name', 'Address', 'City', 'Country', 'Latitude', 'Longitude', 'Color']

export function MarkersDashboardView() {
   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const { isMarkersDashboardOpen, setIsMarkersDashboardOpen } =
      useMarkersDashboard()

   const { rows, selectedRows, createNewMarker } = MarkersDashboardController()
   
   // TODO Add delete marker
   // TODO Add fields are editable
   // TODO Add field change, fetch other fiels data using ors
   // TODO Add color selector
   // TODO Add display marker on map
   // TODO Add random color when creating new marker
   // TODO Make country not updatable
   // TODO Make locality not updatable
   // TODO Make latitude, longitude and adress editable

   return (
      <Drawer
         onOpenChange={setIsMarkersDashboardOpen}
         open={isMarkersDashboardOpen}
         onClose={(): void => {
            setIsNavBarDisplayed(true)
            setIsSearchBarDisplayed(true)
         }}>
         <DrawerContent
            onInteractOutside={(): void => {
               setIsNavBarDisplayed(true)
               setIsSearchBarDisplayed(true)
            }}>
            <div className="mx-auto w-full">
               <DrawerHeader>
                  <DrawerTitle>Your Makers</DrawerTitle>
                  <DrawerDescription>Manage and create markers on the map from here.</DrawerDescription>
               </DrawerHeader>
               <div className="px-8">
                  <Table
                     isHeaderSticky={true}
                     className="overflow-auto max-h-[20vh]"
                     aria-label="Table of your markers"
                     color="primary"
                     selectionMode="multiple">
                     <TableHeader>
                        {columns.map((column: string, index: number) =>
                           <TableColumn key={index}>{column}</TableColumn>,
                        )}
                     </TableHeader>
                     <TableBody emptyContent={
                        <>
                           <h2 className="pb-4">No existing marker :(</h2>
                           <Button onClick={createNewMarker}>Create new marker</Button>
                        </>
                     }>
                        {rows.map((row: Marker, index: number) => (
                           <TableRow key={index}>
                              {Object.keys(row).map((key: any) => (
                                 <TableCell key={key.toString()}>{getKeyValue(row, key)}</TableCell>
                              ))}
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
                  <div className="pt-4 flex flex-row justify-evenly">
                     {rows.length > 0 && <Button onClick={createNewMarker}>Create new marker</Button>}
                     <Button disabled={selectedRows.length <= 0}>Compute track with selected markers</Button>
                  </div>
               </div>

               <DrawerFooter>
                  <DrawerClose asChild>
                     <Button variant="bordered" isIconOnly aria-label="Close" onClick={(): void => {
                        setIsMarkersDashboardOpen(false)
                     }}><CloseIcon /></Button>
                  </DrawerClose>
               </DrawerFooter>
            </div>
         </DrawerContent>
      </Drawer>
   )
}