'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'

import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import {
   Button,
   Checkbox,
   getKeyValue,
   Input,
   Switch,
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
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import { CrosshairIcon, DownloadIcon, Eye as VisibilityOnIcon, EyeOff as VisibilityOffIcon, PlusIcon, UploadIcon } from 'lucide-react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { PUCK_COLOR } from '@/app/constants/colors'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { CursorModeType } from '@/app/enums/modeType'
import { reverseORS } from '@/app/server/services/openRouteService'
import { ObjectType } from '@/app/enums/objectType'
import {
   MAX_LATITUDE,
   MAX_LONGITUDE,
   MIN_LATITUDE,
   MIN_LONGITUDE,
} from '@/app/constants/numbers'


const columns: string[] = ['Selection', 'Title', 'Address', 'Latitude', 'Longitude', 'Color', 'Actions']

type CoordinateField = 'latitude' | 'longitude'
type ToastTone = 'danger' | 'info'

interface MarkerToast {
   message: string
   tone: ToastTone
}

const parseCoordinateInput = (rawValue: string): number | null => {
   const normalizedValue = rawValue.trim().replace(',', '.')

   if (
      normalizedValue === ''
      || normalizedValue === '-'
      || normalizedValue === '+'
      || normalizedValue === '.'
      || normalizedValue === '-.'
      || normalizedValue === '+.'
   ) {
      return null
   }

   const parsedValue = Number(normalizedValue)

   return Number.isFinite(parsedValue)
      ? parsedValue
      : null
}

const getCoordinateErrorMessage = (
   field: CoordinateField,
   value: number | null,
): string | null => {
   if (value == null) {
      return field === 'latitude'
         ? 'Latitude must be a valid number.'
         : 'Longitude must be a valid number.'
   }

   if (field === 'latitude' && (value < MIN_LATITUDE || value > MAX_LATITUDE)) {
      return 'Latitude must be between -90 and 90.'
   }

   if (field === 'longitude' && (value < MIN_LONGITUDE || value > MAX_LONGITUDE)) {
      return 'Longitude must be between -180 and 180.'
   }

   return null
}

export function MarkersDashboardView() {
   const {
      isMarkersDashboardOpen,
      setIsMarkersDashboardOpen,
      markers,
      areMarkerTitlesVisible,
      setAreMarkerTitlesVisible,
      coordinateSelectionMarkerId,
      setCoordinateSelectionMarkerId,
   } =
      useMarkersDashboard()

   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()
   const { setCursorMode, setSelectedObjectData, setSelectedObjectType } = useSelection()

   const [toast, setToast] = useState<MarkerToast | null>(null)
   const [coordinateErrors, setCoordinateErrors] = useState<Record<string, Partial<Record<CoordinateField, string>>>>({})
   const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
   const isClosingForCoordinateSelectionRef = useRef<boolean>(false)

   const restoreMainUi = useCallback((): void => {
      setIsNavBarDisplayed(true)
      setIsSearchBarDisplayed(true)
   }, [setIsNavBarDisplayed, setIsSearchBarDisplayed])

   const hideMainUi = useCallback((): void => {
      setIsNavBarDisplayed(false)
      setIsSearchBarDisplayed(false)
   }, [setIsNavBarDisplayed, setIsSearchBarDisplayed])

   const clearTransientFormState = useCallback((): void => {
      setCoordinateErrors({})
      setToast(null)
   }, [])

   const handleMarkersDashboardOpenChange = useCallback((isOpen: boolean): void => {
      setIsMarkersDashboardOpen(isOpen)

      if (!isOpen) {
         if (isClosingForCoordinateSelectionRef.current) {
            isClosingForCoordinateSelectionRef.current = false
         } else {
            restoreMainUi()
            setCoordinateSelectionMarkerId(null)
            setCursorMode(CursorModeType.HAND)
         }

         clearTransientFormState()
      } else {
         clearTransientFormState()
      }
   }, [
      clearTransientFormState,
      restoreMainUi,
      setCoordinateSelectionMarkerId,
      setCursorMode,
      setIsMarkersDashboardOpen,
   ])

   const handleMarkersDashboardClose = useCallback((): void => {
      handleMarkersDashboardOpenChange(false)
   }, [handleMarkersDashboardOpenChange])

   const showToast = useCallback((message: string, tone: ToastTone = 'danger'): void => {
      setToast({ message, tone })

      if (toastTimeoutRef.current != null) {
         clearTimeout(toastTimeoutRef.current)
      }

      toastTimeoutRef.current = setTimeout(() => {
         setToast(null)
      }, 2600)
   }, [])

   useEffect((): (() => void) => {
      return (): void => {
         if (toastTimeoutRef.current != null) {
            clearTimeout(toastTimeoutRef.current)
         }
      }
   }, [])

   const { flyToCoordinates } = CameraFlyController()

   const {
      selectedRows,
      selectMarker,
      exportSelectedMarkers,
      importMarkersFromFile,
      createNewMarker,
      updateMarker,
      deleteMarker,
      featureSuggestions,
      autoCompleteLoading,
      onSelectionChange,
      onInputChange,
      onCoordsChange,
      fillPuckAddressIfMissing,
   } = MarkersDashboardController()

   useEffect(() => {
      if (!isMarkersDashboardOpen) return

      void fillPuckAddressIfMissing()
   }, [isMarkersDashboardOpen, fillPuckAddressIfMissing])

   const fileInputRef = useRef<HTMLInputElement | null>(null)
   const [isDragOver, setIsDragOver] = useState<boolean>(false)

   const handleImportFile = useCallback(async (file: File): Promise<void> => {
      const error = await importMarkersFromFile(file)

      if (error != null) {
         showToast(error, 'danger')
         return
      }

      showToast(`Markers imported successfully.`, 'info')
   }, [importMarkersFromFile, showToast])

   const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0]
      if (file != null) {
         void handleImportFile(file)
      }

      event.target.value = ''
   }, [handleImportFile])

   const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)

      const file = event.dataTransfer.files[0]
      if (file != null) {
         void handleImportFile(file)
      }
   }, [handleImportFile])

   const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(true)
   }, [])

   const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)
   }, [])

   const setCoordinateError = useCallback((
      markerId: string,
      field: CoordinateField,
      errorMessage: string,
   ): void => {
      setCoordinateErrors(prevErrors => {
         return {
            ...prevErrors,
            [markerId]: {
               ...prevErrors[markerId],
               [field]: errorMessage,
            },
         }
      })
   }, [])

   const clearCoordinateError = useCallback((markerId: string, field: CoordinateField): void => {
      setCoordinateErrors(prevErrors => {
         if (prevErrors[markerId] == null || prevErrors[markerId]?.[field] == null) {
            return prevErrors
         }

         const nextMarkerErrors = { ...prevErrors[markerId] }
         delete nextMarkerErrors[field]

         return {
            ...prevErrors,
            [markerId]: nextMarkerErrors,
         }
      })
   }, [])

   const commitCoordinateInput = useCallback((
      marker: Marker,
      rowIndex: number,
      field: CoordinateField,
      rawValue: string,
   ): void => {
      const parsedValue = parseCoordinateInput(rawValue)
      const errorMessage = getCoordinateErrorMessage(field, parsedValue)

      if (errorMessage != null) {
         setCoordinateError(marker.id, field, errorMessage)
         showToast(errorMessage, 'danger')
         return
      }

      clearCoordinateError(marker.id, field)

      const updatedMarker: Marker = {
         ...marker,
         [field]: parsedValue,
      }

      updateMarker(rowIndex, updatedMarker)
      onCoordsChange(updatedMarker)
   }, [clearCoordinateError, onCoordsChange, setCoordinateError, showToast, updateMarker])

   const startMapCoordinateSelection = useCallback((
      event: React.MouseEvent<SVGSVGElement>,
      marker: Marker,
   ): void => {
      event.preventDefault()
      event.stopPropagation()

      isClosingForCoordinateSelectionRef.current = true
      setCoordinateSelectionMarkerId(marker.id)
      setCursorMode(CursorModeType.POINTER)
      hideMainUi()
      handleMarkersDashboardOpenChange(false)
   }, [
      hideMainUi,
      handleMarkersDashboardOpenChange,
      setCoordinateSelectionMarkerId,
      setCursorMode,
   ])

   const focusMarkerAndDisplayPlace = useCallback(async (marker: Marker): Promise<void> => {
      if (!Number.isFinite(marker.latitude) || !Number.isFinite(marker.longitude)) {
         showToast('Marker coordinates are invalid.', 'danger')
         return
      }

      handleMarkersDashboardClose()

      flyToCoordinates(
         marker.latitude,
         marker.longitude,
      )

      try {
         const data: GeocodeResponse = await reverseORS(
            marker.longitude,
            marker.latitude,
         )

         const placeFeature = data.features?.[0]
         if (placeFeature == null) {
            showToast('Unable to resolve place details for this marker.', 'info')
            return
         }

         setSelectedObjectData(placeFeature)
         setSelectedObjectType(ObjectType.PLACE)
      } catch {
         showToast('Unable to load place details for this marker.', 'danger')
      }
   }, [
      flyToCoordinates,
      handleMarkersDashboardClose,
      setSelectedObjectData,
      setSelectedObjectType,
      showToast,
   ])

   const patchMarker = useCallback((
      rowIndex: number,
      marker: Marker,
      patch: Partial<Marker>,
   ): void => {
      updateMarker(rowIndex, {
         ...marker,
         ...patch,
      })
   }, [updateMarker])

   const renderCell = React.useCallback((marker: Marker, cellKey: string, cellValue: string | number | boolean, rowIndex: number) => {
      const markerId = marker.id

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
                  placeholder="Enter marker title"
                  aria-label="Enter marker title"
                  value={marker.isPuck ? 'Your position' : cellValue.toString()}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                     patchMarker(rowIndex, marker, {
                        name: event.target.value,
                     })
                  }}
               />
            )
         case 'address':
            if (marker.isPuck) {
               return (
                  <Input
                     isDisabled
                     type="text"
                     size="sm"
                     variant="bordered"
                     placeholder="Resolving your position..."
                     value={cellValue.toString()}
                  />
               )
            }

            const options: Option[] = featureSuggestions.map((feature: Feature) => ({
               label: feature.properties.label,
               value: feature.properties.id,
            }))

            const value: Option = ({ label: cellValue.toString(), value: cellValue.toString() })

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
                  disabled={marker.isPuck}
               />
            )
         case 'latitude':
            return (
               <Input
                  isDisabled={marker.isPuck}
                  type="text"
                  inputMode="decimal"
                  variant="bordered"
                  placeholder="Enter the marker latitude"
                  size="sm"
                  key={`latitude-${markerId}-${cellValue}`}
                  defaultValue={cellValue.toString()}
                  isInvalid={coordinateErrors[markerId]?.latitude != null}
                  errorMessage={coordinateErrors[markerId]?.latitude}
                  onChange={(): void => {
                     clearCoordinateError(markerId, 'latitude')
                  }}
                  onBlur={(event: React.FocusEvent<HTMLInputElement>): void => {
                     commitCoordinateInput(marker, rowIndex, 'latitude', event.target.value)
                  }}
               />
            )
         case 'longitude':
            return (
               <Input
                  isDisabled={marker.isPuck}
                  type="text"
                  inputMode="decimal"
                  variant="bordered"
                  placeholder="Enter the marker longitude"
                  size="sm"
                  key={`longitude-${markerId}-${cellValue}`}
                  defaultValue={cellValue.toString()}
                  isInvalid={coordinateErrors[markerId]?.longitude != null}
                  errorMessage={coordinateErrors[markerId]?.longitude}
                  onChange={(): void => {
                     clearCoordinateError(markerId, 'longitude')
                  }}
                  onBlur={(event: React.FocusEvent<HTMLInputElement>): void => {
                     commitCoordinateInput(marker, rowIndex, 'longitude', event.target.value)
                  }}
               />
            )
         case 'color':
            return (
               <ColorPicker
                  onChange={(newColor: string): void => {
                     patchMarker(rowIndex, marker, {
                        color: newColor,
                     })
                  }}
                  isDisabled={marker.isPuck}
                  value={marker.isPuck ? PUCK_COLOR : cellValue.toString()}
               />
            )
         case 'actions':
            const isCoordinateSelectionArmed: boolean = coordinateSelectionMarkerId === markerId
            const canToggleTitleVisibility = marker.name.trim().length > 0

            return (
               <div className="relative flex items-center gap-2">
                  <Tooltip content="View on map">
                     <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <EyeIcon onClick={(): void => {
                           void focusMarkerAndDisplayPlace(marker)
                        }} />
                     </span>
                  </Tooltip>
                  {!marker.isPuck && <Tooltip
                     content={isCoordinateSelectionArmed ? 'Coordinate picker enabled' : 'Pick coordinates on map'}>
                     <span
                        data-map-pick-ignore="true"
                        className={`text-lg cursor-pointer active:opacity-50 ${isCoordinateSelectionArmed ? 'text-primary' : 'text-default-400'}`}>
                        <CrosshairIcon className="h-[1em] w-[1em]" onClick={(event): void => {
                           startMapCoordinateSelection(event, marker)
                        }} />
                     </span>
                  </Tooltip>}
                  <Tooltip
                     content={marker.showTitleOnMap ? 'Hide title on map' : 'Show title on map'}>
                     <button
                        type="button"
                        aria-label="Toggle marker title on map"
                        data-title-visible={marker.showTitleOnMap ? 'true' : 'false'}
                        disabled={!canToggleTitleVisibility}
                        className={`text-lg active:opacity-50 ${canToggleTitleVisibility ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${marker.showTitleOnMap ? 'text-primary' : 'text-default-400'}`}
                        onClick={(): void => {
                           if (!canToggleTitleVisibility) {
                              return
                           }

                           patchMarker(rowIndex, marker, {
                              showTitleOnMap: !marker.showTitleOnMap,
                           })
                        }}
                     >
                        {marker.showTitleOnMap ? (
                           <VisibilityOnIcon className="h-[1em] w-[1em]" />
                        ) : (
                           <VisibilityOffIcon className="h-[1em] w-[1em]" />
                        )}
                     </button>
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
   }, [
      featureSuggestions,
      onInputChange,
      autoCompleteLoading,
      selectMarker,
      onSelectionChange,
      clearCoordinateError,
      coordinateErrors,
      coordinateSelectionMarkerId,
      commitCoordinateInput,
      deleteMarker,
      focusMarkerAndDisplayPlace,
      patchMarker,
      startMapCoordinateSelection,
   ])

   if (!isMarkersDashboardOpen) {
      return null
   }

   return (
      <Drawer
         dismissible
         onOpenChange={handleMarkersDashboardOpenChange}
         open={isMarkersDashboardOpen}
         onClose={handleMarkersDashboardClose}>
         <DrawerContent
            data-map-pick-ignore="true"
            onInteractOutside={(event): void => {
               handleMarkersDashboardClose()
               event.stopPropagation()
               event.preventDefault()
            }}
         >
            <div className="mx-auto w-full">
               {toast != null && (
                  <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
                     <div
                        className={`flex w-full max-w-lg items-center rounded-lg p-4 text-white shadow-lg ring-1 ring-black/5 backdrop-blur-md ${toast.tone === 'danger' ? 'bg-red-700/25' : 'bg-blue-700/25'}`}
                        role="status"
                     >
                        <div className="text-sm font-normal">{toast.message}</div>
                     </div>
                  </div>
               )}
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
                        onPress={handleMarkersDashboardClose}
                        className="absolute top-4 right-4"
                     >
                        <CloseIcon />
                     </Button>
                  </DrawerClose>
               </DrawerHeader>
               <div className="px-8">
                  <div className="flex flex-wrap items-center justify-end gap-3 pb-3">
                     <Switch
                        data-testid="global-marker-titles-toggle"
                        size="sm"
                        aria-label="Show all marker titles"
                        isSelected={areMarkerTitlesVisible}
                        onValueChange={setAreMarkerTitlesVisible}
                     >
                        Show all marker titles
                     </Switch>
                  </div>
                  <div
                     data-testid="marker-drop-zone"
                     onDrop={handleDrop}
                     onDragOver={handleDragOver}
                     onDragLeave={handleDragLeave}
                     className={`relative rounded-lg transition-colors ${isDragOver ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                  >
                     {isDragOver && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary/10 backdrop-blur-md">
                           <p className="text-sm font-medium text-primary">Drop JSON file to import markers</p>
                        </div>
                     )}
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
                           <Button size="sm" onPress={createNewMarker} startContent={<PlusIcon />}>Create
                              new
                              marker</Button>
                        }>
                           {markers.map((row: Marker, rowIndex: number) => (
                              <TableRow key={rowIndex} className="h-4">
                                 {Object.keys(row)
                                    .filter((key: string): boolean => key !== 'id' && key !== 'isPuck' && key !== 'showTitleOnMap') // Filter out non-column fields.
                                    .map((key: string) => (
                                       <TableCell key={key}>
                                          {renderCell(row, key, getKeyValue(row, key), rowIndex)}
                                       </TableCell>
                                    ))}
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
                  <input
                     ref={fileInputRef}
                     type="file"
                     accept=".json,application/json"
                     className="hidden"
                     aria-hidden="true"
                     onChange={handleFileInputChange}
                  />
                  <div className="pt-4 pb-4 flex flex-row justify-evenly">
                     {markers.length > 0 &&
                        <Button 
                           variant="bordered" 
                           size="sm" 
                           onPress={createNewMarker} 
                           startContent={<PlusIcon />}
                           aria-label="Create new marker"
                        >
                           Create new marker
                        </Button>
                     }
                     <Button
                        variant="bordered"
                        size="sm"
                        onPress={() => fileInputRef.current?.click()}
                        startContent={<UploadIcon />}
                        aria-label="Import markers"
                     >
                        Import markers
                     </Button>
                     <Button
                        variant="bordered"
                        size="sm"
                        isDisabled={selectedRows.length === 0}
                        onPress={exportSelectedMarkers}
                        startContent={<DownloadIcon />}
                        aria-label="Export selected markers"
                     >
                        Export selected markers
                     </Button>
                     <Button 
                        variant="bordered" 
                        size="sm" 
                        isDisabled={selectedRows.length <= 1}
                        aria-label="Compute track with selected markers"
                     >
                        Compute track with selected markers
                     </Button>
                  </div>
               </div>
            </div>
         </DrawerContent>
      </Drawer>
   )
}