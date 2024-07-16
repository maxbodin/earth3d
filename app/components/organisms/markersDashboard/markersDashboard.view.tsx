'use client'
import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'

import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import {
   Button,
   Checkbox,
   getKeyValue,
   Input,
   Table,
   TableBody,
   TableCell,
   TableColumn,
   TableHeader,
   TableRow,
   Tooltip,
} from '@nextui-org/react'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { CloseIcon, DeleteIcon, EyeIcon } from '@nextui-org/shared-icons'
import { Marker } from '@/app/types/marker'
import { MarkersDashboardController } from '@/app/components/organisms/markersDashboard/markersDashboard.controller'
import { ColorPicker } from '@/shadcn/ui/colorPicker'
import { AutoComplete, Option } from '@/shadcn/ui/autocomplete'
import { Feature } from '@/app/types/orsTypes'
import { PlusIcon } from 'lucide-react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { PUCK_COLOR } from '@/app/constants/colors'


const columns: string[] = ['Selection', 'Name', 'Address', 'Latitude', 'Longitude', 'Color', 'Actions']

export function MarkersDashboardView() {
   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const { isMarkersDashboardOpen, setIsMarkersDashboardOpen } =
      useMarkersDashboard()

   const { flyToCoordinates } = CameraFlyController()

   const {
      selectedRows,
      selectMarker,
      createNewMarker,
      updateMarker,
      deleteMarker,
      featureSuggestions,
      autoCompleteLoading,
      autoCompleteError,
      onSelectionChange,
      onInputChange,
      onCoordsChange,
   } = MarkersDashboardController()

   const { markers } = useMarkersDashboard()

   const renderCell = React.useCallback((marker: Marker, cellKey: string, cellValue: string | number, rowIndex: number) => {
      switch (cellKey) {
         case 'selection':
            return (
               <Checkbox
                  onValueChange={(): void => selectMarker(marker)}>
               </Checkbox>
            )
         case 'name':
            return (
               <Input
                  isDisabled={marker.isPuck}
                  type="text"
                  size="sm"
                  variant="bordered"
                  placeholder="Enter the marker name"
                  aria-label="Enter the marker name"
                  value={marker.isPuck ? 'Your position' : cellValue.toString()}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                     marker.name = event.target.value
                     updateMarker(rowIndex, marker)
                  }}
               />
            )
         case 'address':
            const options: Option[] = featureSuggestions.map((feature: Feature) => ({
               label: feature.properties.label,
               value: feature.properties.id,
            }))

            const value: Option = ({ label: cellValue.toString(), value: cellValue.toString() })

            console.log(value)

            // TODO IF IS PUCK, SET AUTOMATICALLY ADDRESS AND DISABLE AUTOCOMPLETE
            return (
               <AutoComplete
                  options={options}
                  emptyMessage="No results."
                  aria-label="Enter the marker address"
                  placeholder="Enter the marker address"
                  onInputChange={onInputChange}
                  onSelectionChange={(option: Option) => onSelectionChange(option, marker)}
                  value={value}
                  isLoading={autoCompleteLoading}
               />
            )
         case 'latitude':
            return (
               <Input
                  isDisabled={marker.isPuck}
                  type="number"
                  variant="bordered"
                  placeholder="Enter the marker latitude"
                  size="sm"
                  value={cellValue.toString()}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                     // Convert string input to number.
                     const newLatitude: number = parseFloat(event.target.value)
                     // Ensure the value is a valid number.
                     if (!isNaN(newLatitude)) {
                        marker.latitude = newLatitude
                        updateMarker(rowIndex, marker)
                        onCoordsChange(marker)
                     }
                  }} />
            )
         case 'longitude':
            return (
               <Input
                  isDisabled={marker.isPuck}
                  type="number"
                  variant="bordered"
                  placeholder="Enter the marker longitude"
                  size="sm"
                  value={cellValue.toString()}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                     // Convert string input to number.
                     const newLongitude: number = parseFloat(event.target.value)
                     // Ensure the value is a valid number.
                     if (!isNaN(newLongitude)) {
                        marker.longitude = newLongitude
                        updateMarker(rowIndex, marker)
                        onCoordsChange(marker)
                     }
                  }} />
            )
         case 'color':
            return (
               <ColorPicker
                  onChange={(newColor: string): void => {
                     marker.color = newColor
                     updateMarker(rowIndex, marker,
                     )
                  }}
                  isDisabled={marker.isPuck}
                  value={marker.isPuck ? PUCK_COLOR : cellValue.toString()}
               />
            )
         case 'actions':
            return (
               <div className="relative flex items-center gap-2">
                  <Tooltip content="View on map">
                     <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <EyeIcon onClick={(): void => {
                           flyToCoordinates(
                              marker.latitude,
                              marker.longitude,
                           )
                        }} />
                     </span>
                  </Tooltip>
                  {!marker.isPuck && <Tooltip color="danger" content="Delete marker">
                     <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon onClick={(): void => {
                           deleteMarker(marker)
                        }} />
                     </span>
                  </Tooltip>}
               </div>
            )
         default:
            return cellValue
      }
   }, [featureSuggestions, onInputChange, autoCompleteLoading, selectMarker, updateMarker, onSelectionChange, onCoordsChange, deleteMarker])

   return (
      <Drawer
         dismissible={false}
         onOpenChange={setIsMarkersDashboardOpen}
         open={isMarkersDashboardOpen}
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
                     <DrawerTitle>📍 Manage and create markers on Earth</DrawerTitle>
                  </div>
                  <DrawerClose asChild>
                     <Button
                        variant="bordered"
                        isIconOnly
                        size="sm"
                        aria-label="Close"
                        onClick={(): void => {
                           setIsMarkersDashboardOpen(false)
                        }}
                        className="absolute top-4 right-4"
                     >
                        <CloseIcon />
                     </Button>
                  </DrawerClose>
               </DrawerHeader>
               <div className="px-8">
                  <Table
                     isHeaderSticky
                     className="overflow-auto max-h-[25vh]"
                     aria-label="Table of your markers"
                     color="primary">
                     <TableHeader>
                        {columns.map((column: string, index: number) =>
                           <TableColumn key={index}
                                        align={column === 'Actions' ? 'center' : 'start'}>{column}</TableColumn>,
                        )}
                     </TableHeader>
                     <TableBody
                        className="h-2" emptyContent={
                        <Button size="sm" onClick={createNewMarker} startContent={<PlusIcon />}>Create
                           new
                           marker</Button>
                     }>
                        {markers.map((row: Marker, rowIndex: number) => (
                           <TableRow key={rowIndex} className="h-4">
                              {Object.keys(row)
                                 .filter((key: string): boolean => key !== 'id' && key !== 'isPuck') // Filter out the 'id' key and the isPuck key.
                                 .map((key: string) => (
                                    <TableCell key={key}>
                                       {renderCell(row, key, getKeyValue(row, key), rowIndex)}
                                    </TableCell>
                                 ))}
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
                  <div className="pt-4 pb-4 flex flex-row justify-evenly">
                     {markers.length > 0 && markers.length < 5 &&
                        <Button variant="bordered" size="sm" onClick={createNewMarker} startContent={<PlusIcon />}>Create
                           new marker</Button>}
                     <Button variant="bordered" size="sm" isDisabled={selectedRows.length <= 1}>Compute track with
                        selected markers</Button>
                  </div>
               </div>
            </div>
         </DrawerContent>
      </Drawer>
   )
}

// TODO IMPORTANT CREATE MY OWN SYSTEM TO HANDLE ROW SELECTION WITH CHECKBOX ON EACH ROW => IN ORDER TO SOLVE PROBLEM WITH EVENTS ON NEXT.UI ROW SELECTION
// TODO CUSTOM ROW SELECTION => Allow to creat the track between markers with a specified order => set number in the checkbox
// TODO ORS call when updating coords and none null
// TODO When doing a place search, the selected place is added to the markers
// TODO Credit drawer
// TODO On searchbar select country, display country name
// TODO Display place options in autocomplete upper