'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useUi } from '@/app/context/uiContext'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import {
   Button,
   Checkbox,
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
import { CircleMarker } from '@/app/types/circleMarker'
import { MarkersDashboardController } from '@/app/components/organisms/markersDashboard/markersDashboard.controller'
import { ColorPicker } from '@/shadcn/ui/colorPicker'
import { AutoComplete, Option } from '@/shadcn/ui/autocomplete'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import {
   CircleIcon,
   CrosshairIcon,
   DownloadIcon,
   Eye as VisibilityOnIcon,
   EyeOff as VisibilityOffIcon,
   PlusIcon,
   RulerIcon,
   UploadIcon
} from 'lucide-react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { PUCK_COLOR } from '@/app/constants/colors'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { CursorModeType } from '@/app/enums/modeType'
import { reverseORS } from '@/app/server/services/openRouteService'
import { ObjectType } from '@/app/enums/objectType'
import { CIRCLE_RADIUS_SLIDER_STEP_KM, MAX_CIRCLE_RADIUS_KM, MIN_CIRCLE_RADIUS_KM, } from '@/app/constants/numbers'
import { isValidCoordinate } from '@/lib/isValid/isValidCoordinate'
import { normalizeCircleRadiusKm } from '@/lib/normalize/normalizeCircleRadiusKm'
import { parseNumberInput } from '@/lib/parse/parseNumberInput'
import { isValidLatitude } from '@/lib/isValid/isValidLatitude'
import { isValidLongitude } from '@/lib/isValid/isValidLongitude'


type MarkerColumnKey = 'selection' | 'name' | 'address' | 'latitude' | 'longitude' | 'color' | 'actions'
type CircleColumnKey = keyof Pick<CircleMarker, 'name' | 'latitude' | 'longitude' | 'radiusKm' | 'color'> | 'actions'

const markerColumns: { key: MarkerColumnKey, label: string }[] = [
   { key: 'selection', label: 'Selection' },
   { key: 'name', label: 'Title' },
   { key: 'address', label: 'Address' },
   { key: 'latitude', label: 'Latitude' },
   { key: 'longitude', label: 'Longitude' },
   { key: 'color', label: 'Color' },
   { key: 'actions', label: 'Actions' },
]
const circleColumns: { key: CircleColumnKey, label: string }[] = [
   { key: 'name', label: 'Title' },
   { key: 'latitude', label: 'Center Latitude' },
   { key: 'longitude', label: 'Center Longitude' },
   { key: 'radiusKm', label: 'Radius (km)' },
   { key: 'color', label: 'Color' },
   { key: 'actions', label: 'Actions' },
]

type CoordinateField = 'latitude' | 'longitude'
type ToastTone = 'danger' | 'info'

interface MarkerToast {
   message: string
   tone: ToastTone
}

/**
 * Returns a validation error message for an out-of-range circle radius, or `null` if valid.
 * @param value
 */
const getCircleRadiusErrorMessage = (value: number | null): string | null => {
   if (value == null) return 'Radius must be a valid number.'
   if (value < MIN_CIRCLE_RADIUS_KM || value > MAX_CIRCLE_RADIUS_KM) {
      return `Radius must be between ${MIN_CIRCLE_RADIUS_KM} and ${MAX_CIRCLE_RADIUS_KM} km.`
   }

   return null
}

/**
 * Returns a validation error message for an out-of-range coordinate, or `null` if valid.
 * @param field
 * @param value
 */
const getCoordinateErrorMessage = (
   field: CoordinateField,
   value: number | null,
): string | null => {
   if (value == null) {
      return field === 'latitude'
         ? 'Latitude must be a valid number.'
         : 'Longitude must be a valid number.'
   }

   if (field === 'latitude' && isValidLatitude(value)) {
      return 'Latitude must be between -90 and 90.'
   }

   if (field === 'longitude' && isValidLongitude(value)) {
      return 'Longitude must be between -180 and 180.'
   }

   return null
}

export function MarkersDashboardView() {
   const {
      isMarkersDashboardOpen,
      setIsMarkersDashboardOpen,
      markers,
      circleMarkers,
      areMarkerTitlesVisible,
      setAreMarkerTitlesVisible,
      coordinateSelectionMarkerId,
      setCoordinateSelectionMarkerId,
      coordinateSelectionCircleId,
      setCoordinateSelectionCircleId,
   } =
      useMarkersDashboard()

   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()
   const { setCursorMode, setSelectedObjectData, setSelectedObjectType } = useSelection()

   const { flyToCoordinates } = CameraFlyController()

   const {
      selectedRows,
      selectMarker,
      exportSelectedMarkers,
      importMarkersFromFile,
      createNewMarker,
      createNewCircleMarker,
      updateMarker,
      updateCircleMarker,
      deleteMarker,
      deleteCircleMarker,
      featureSuggestions,
      autoCompleteLoading,
      onSelectionChange,
      onInputChange,
      onCoordsChange,
      fillPuckAddressIfMissing,
      measureDistance,
      clearSelectedRows,
   } = MarkersDashboardController()

   const [toast, setToast] = useState<MarkerToast | null>(null)
   const [coordinateErrors, setCoordinateErrors] = useState<Record<string, Partial<Record<CoordinateField, string>>>>({})
   const [circleRadiusErrors, setCircleRadiusErrors] = useState<Record<string, string>>({})
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
      setCircleRadiusErrors({})
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
            setCoordinateSelectionCircleId(null)
            setCursorMode(CursorModeType.HAND)
         }

         clearTransientFormState()
         clearSelectedRows()
      } else {
         clearTransientFormState()
      }
   }, [
      clearTransientFormState,
      clearSelectedRows,
      restoreMainUi,
      setCoordinateSelectionCircleId,
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
      const parsedValue = parseNumberInput(rawValue)
      const errorMessage = getCoordinateErrorMessage(field, parsedValue)

      if (parsedValue == null || errorMessage != null) {
         const nextErrorMessage = errorMessage ?? getCoordinateErrorMessage(field, null) ?? 'Coordinate must be a valid number.'
         setCoordinateError(marker.id, field, nextErrorMessage)
         showToast(nextErrorMessage, 'danger')
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

   /**
    *
    */
   const commitCircleCoordinateInput = useCallback((
      circleMarker: CircleMarker,
      rowIndex: number,
      field: CoordinateField,
      rawValue: string,
   ): void => {
      const parsedValue = parseNumberInput(rawValue)
      const errorMessage = getCoordinateErrorMessage(field, parsedValue)

      if (parsedValue == null || errorMessage != null) {
         const nextErrorMessage = errorMessage ?? getCoordinateErrorMessage(field, null) ?? 'Coordinate must be a valid number.'
         setCoordinateError(circleMarker.id, field, nextErrorMessage)
         showToast(nextErrorMessage, 'danger')
         return
      }

      clearCoordinateError(circleMarker.id, field)

      updateCircleMarker(rowIndex, {
         ...circleMarker,
         [field]: parsedValue,
      })
   }, [clearCoordinateError, setCoordinateError, showToast, updateCircleMarker])

   /**
    *
    */
   const setCircleRadiusError = useCallback((circleMarkerId: string, errorMessage: string): void => {
      setCircleRadiusErrors(prevErrors => ({
         ...prevErrors,
         [circleMarkerId]: errorMessage,
      }))
   }, [])

   /**
    *
    */
   const clearCircleRadiusError = useCallback((circleMarkerId: string): void => {
      setCircleRadiusErrors(prevErrors => {
         if (prevErrors[circleMarkerId] == null) return prevErrors

         const nextErrors = { ...prevErrors }
         delete nextErrors[circleMarkerId]
         return nextErrors
      })
   }, [])

   /**
    *
    */
   const updateCircleRadiusFromInput = useCallback((
      circleMarker: CircleMarker,
      rowIndex: number,
      rawValue: string,
   ): void => {
      const parsedValue = parseNumberInput(rawValue)
      const errorMessage = getCircleRadiusErrorMessage(parsedValue)

      if (parsedValue == null || errorMessage != null) {
         setCircleRadiusError(circleMarker.id, errorMessage ?? 'Radius must be a valid number.')
         return
      }

      clearCircleRadiusError(circleMarker.id)
      updateCircleMarker(rowIndex, {
         ...circleMarker,
         radiusKm: normalizeCircleRadiusKm(parsedValue),
      })
   }, [clearCircleRadiusError, setCircleRadiusError, updateCircleMarker])

   /**
    * Activates map coordinate picking mode for a marker.
    */
   const startMapCoordinateSelection = useCallback((
      marker: Marker,
   ): void => {

      isClosingForCoordinateSelectionRef.current = true
      setCoordinateSelectionMarkerId(marker.id)
      setCoordinateSelectionCircleId(null)
      setCursorMode(CursorModeType.POINTER)
      hideMainUi()
      handleMarkersDashboardOpenChange(false)
   }, [
      hideMainUi,
      handleMarkersDashboardOpenChange,
      setCoordinateSelectionMarkerId,
      setCoordinateSelectionCircleId,
      setCursorMode,
   ])

   /**
    * Activates map coordinate picking mode for a circle marker center.
    */
   const startCircleCenterSelection = useCallback((
      circleMarker: CircleMarker,
   ): void => {
      isClosingForCoordinateSelectionRef.current = true
      setCoordinateSelectionMarkerId(null)
      setCoordinateSelectionCircleId(circleMarker.id)
      setCursorMode(CursorModeType.POINTER)
      hideMainUi()
      handleMarkersDashboardOpenChange(false)
   }, [
      handleMarkersDashboardOpenChange,
      hideMainUi,
      setCoordinateSelectionMarkerId,
      setCoordinateSelectionCircleId,
      setCursorMode,
   ])

   /**
    *
    */
   const focusMarkerAndDisplayPlace = useCallback(async (marker: Marker): Promise<void> => {
      if (!isValidCoordinate({ latitude: marker.latitude, longitude: marker.longitude })) {
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

   /**
    *
    */
   const patchCircleMarker = useCallback((
      rowIndex: number,
      circleMarker: CircleMarker,
      patch: Partial<CircleMarker>,
   ): void => {
      updateCircleMarker(rowIndex, {
         ...circleMarker,
         ...patch,
      })
   }, [updateCircleMarker])

   /**
    *
    */
   const focusCircleCenter = useCallback((circleMarker: CircleMarker): void => {
      const coordinates = {
         latitude: circleMarker.latitude,
         longitude: circleMarker.longitude,
      }

      if (!isValidCoordinate(coordinates)) {
         showToast('Circle center coordinates are invalid.', 'danger')
         return
      }

      handleMarkersDashboardClose()
      flyToCoordinates(coordinates.latitude, coordinates.longitude)
   }, [flyToCoordinates, handleMarkersDashboardClose, showToast])

   /**
    *
    */
   const renderCell = React.useCallback((marker: Marker, cellKey: MarkerColumnKey, rowIndex: number) => {
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
                  value={marker.isPuck ? 'Your position' : marker.name}
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
                     value={marker.address}
                  />
               )
            }

            const options: Option[] = featureSuggestions.map((feature: Feature) => ({
               label: feature.properties.label,
               value: feature.properties.id,
            }))

            const value: Option = ({ label: marker.address, value: marker.address })

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
                  key={`latitude-${markerId}-${marker.latitude}`}
                  defaultValue={marker.latitude.toString()}
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
                  key={`longitude-${markerId}-${marker.longitude}`}
                  defaultValue={marker.longitude.toString()}
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
                  value={marker.isPuck ? PUCK_COLOR : marker.color}
               />
            )
         case 'actions':
            const isCoordinateSelectionArmed: boolean = coordinateSelectionMarkerId === markerId
            const canToggleTitleVisibility = marker.name.trim().length > 0

            return (
               <div className="relative flex items-center gap-2">
                  <Tooltip content="View on map">
                     <Button isIconOnly size="sm" variant="light" aria-label="View on map" onPress={(): void => {
                        void focusMarkerAndDisplayPlace(marker)
                     }}>
                        <EyeIcon />
                     </Button>
                  </Tooltip>
                  {!marker.isPuck && <Tooltip
                     content={isCoordinateSelectionArmed ? 'Coordinate picker enabled' : 'Pick coordinates on map'}>
                     <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        data-map-pick-ignore="true"
                        aria-label="Pick coordinates on map"
                        className={isCoordinateSelectionArmed ? 'text-primary' : 'text-default-400'}
                        onPress={(): void => {
                           startMapCoordinateSelection(marker)
                        }}
                     >
                        <CrosshairIcon className="h-[1em] w-[1em]" />
                     </Button>
                  </Tooltip>}
                  <Tooltip
                     content={marker.showTitleOnMap ? 'Hide title on map' : 'Show title on map'}>
                     <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label="Toggle marker title on map"
                        data-title-visible={marker.showTitleOnMap ? 'true' : 'false'}
                        isDisabled={!canToggleTitleVisibility}
                        className={marker.showTitleOnMap ? 'text-primary' : 'text-default-400'}
                        onPress={(): void => {
                           if (!canToggleTitleVisibility) return

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
                     </Button>
                  </Tooltip>
                  {!marker.isPuck && <Tooltip color="danger" content="Delete marker">
                     <Button isIconOnly size="sm" variant="light" aria-label="Delete marker" className="text-danger" onPress={(): void => {
                        deleteMarker(marker)
                     }}>
                        <DeleteIcon />
                     </Button>
                  </Tooltip>}
               </div>
            )
         default:
            return null
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

   /**
    *
    */
   const renderCircleCell = React.useCallback((circleMarker: CircleMarker, cellKey: CircleColumnKey, rowIndex: number) => {
      switch (cellKey) {
         case 'name':
            return (
               <Input
                  type="text"
                  size="sm"
                  variant="bordered"
                  placeholder="Enter circle title"
                  aria-label="Enter circle title"
                  value={circleMarker.name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                     patchCircleMarker(rowIndex, circleMarker, {
                        name: event.target.value,
                     })
                  }}
               />
            )
         case 'latitude':
            return (
               <Input
                  type="text"
                  inputMode="decimal"
                  variant="bordered"
                  placeholder="Enter center latitude"
                  aria-label="Enter circle center latitude"
                  size="sm"
                  key={`circle-latitude-${circleMarker.id}-${circleMarker.latitude}`}
                  defaultValue={circleMarker.latitude.toString()}
                  isInvalid={coordinateErrors[circleMarker.id]?.latitude != null}
                  errorMessage={coordinateErrors[circleMarker.id]?.latitude}
                  onChange={(): void => {
                     clearCoordinateError(circleMarker.id, 'latitude')
                  }}
                  onBlur={(event: React.FocusEvent<HTMLInputElement>): void => {
                     commitCircleCoordinateInput(circleMarker, rowIndex, 'latitude', event.target.value)
                  }}
               />
            )
         case 'longitude':
            return (
               <Input
                  type="text"
                  inputMode="decimal"
                  variant="bordered"
                  placeholder="Enter center longitude"
                  aria-label="Enter circle center longitude"
                  size="sm"
                  key={`circle-longitude-${circleMarker.id}-${circleMarker.longitude}`}
                  defaultValue={circleMarker.longitude.toString()}
                  isInvalid={coordinateErrors[circleMarker.id]?.longitude != null}
                  errorMessage={coordinateErrors[circleMarker.id]?.longitude}
                  onChange={(): void => {
                     clearCoordinateError(circleMarker.id, 'longitude')
                  }}
                  onBlur={(event: React.FocusEvent<HTMLInputElement>): void => {
                     commitCircleCoordinateInput(circleMarker, rowIndex, 'longitude', event.target.value)
                  }}
               />
            )
         case 'radiusKm':
            return (
               <div className="grid min-w-[220px] grid-cols-[minmax(96px,1fr)_96px] items-center gap-3">
                  <input
                     type="range"
                     min={MIN_CIRCLE_RADIUS_KM}
                     max={MAX_CIRCLE_RADIUS_KM}
                     step={CIRCLE_RADIUS_SLIDER_STEP_KM}
                     value={circleMarker.radiusKm}
                     aria-label="Drag circle radius"
                     className="h-2 w-full cursor-pointer appearance-none rounded-full accent-primary"
                     onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                        updateCircleRadiusFromInput(circleMarker, rowIndex, event.target.value)
                     }}
                  />
                  <Input
                     type="text"
                     inputMode="decimal"
                     variant="bordered"
                     placeholder="Radius"
                     aria-label="Enter circle radius in kilometers"
                     size="sm"
                     key={`circle-radius-${circleMarker.id}-${circleMarker.radiusKm}`}
                     defaultValue={circleMarker.radiusKm.toString()}
                     isInvalid={circleRadiusErrors[circleMarker.id] != null}
                     errorMessage={circleRadiusErrors[circleMarker.id]}
                     endContent={<span className="text-xs text-default-400">km</span>}
                     onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                        updateCircleRadiusFromInput(circleMarker, rowIndex, event.target.value)
                     }}
                     onBlur={(): void => {
                        const errorMessage = circleRadiusErrors[circleMarker.id]
                        if (errorMessage != null) {
                           showToast(errorMessage, 'danger')
                        }
                     }}
                  />
               </div>
            )
         case 'color':
            return (
               <ColorPicker
                  onChange={(newColor: string): void => {
                     patchCircleMarker(rowIndex, circleMarker, {
                        color: newColor,
                     })
                  }}
                  value={circleMarker.color}
               />
            )
         case 'actions':
            const isCircleCenterSelectionArmed: boolean = coordinateSelectionCircleId === circleMarker.id

            return (
               <div className="relative flex items-center gap-2">
                  <Tooltip content="View circle center on map">
                     <Button isIconOnly size="sm" variant="light" aria-label="View circle center on map" onPress={(): void => {
                        focusCircleCenter(circleMarker)
                     }}>
                        <EyeIcon />
                     </Button>
                  </Tooltip>
                  <Tooltip content={isCircleCenterSelectionArmed ? 'Center picker enabled' : 'Pick circle center on map'}>
                     <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        data-map-pick-ignore="true"
                        aria-label="Pick circle center on map"
                        className={isCircleCenterSelectionArmed ? 'text-primary' : 'text-default-400'}
                        onPress={(): void => {
                           startCircleCenterSelection(circleMarker)
                        }}
                     >
                        <CrosshairIcon className="h-[1em] w-[1em]" />
                     </Button>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete circle marker">
                     <Button isIconOnly size="sm" variant="light" aria-label="Delete circle marker" className="text-danger" onPress={(): void => {
                        deleteCircleMarker(circleMarker)
                     }}>
                        <DeleteIcon />
                     </Button>
                  </Tooltip>
               </div>
            )
         default:
            return null
      }
   }, [
      circleRadiusErrors,
      clearCoordinateError,
      commitCircleCoordinateInput,
      coordinateErrors,
      coordinateSelectionCircleId,
      deleteCircleMarker,
      focusCircleCenter,
      patchCircleMarker,
      showToast,
      startCircleCenterSelection,
      updateCircleRadiusFromInput,
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
                     <DrawerDescription className="sr-only">Create, edit, delete, and manage markers and circle markers on the 3D map.</DrawerDescription>
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
               <div className="px-8 pb-6">
                  <section>
                     <div className="flex items-center justify-between pb-3">
                        <p className="text-sm font-semibold uppercase text-white/45">Markers</p>
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
                           {markerColumns.map(column =>
                              <TableColumn key={column.key}
                                           align={column.key === 'actions' ? 'center' : 'start'}>{column.label}</TableColumn>,
                           )}
                        </TableHeader>
                        <TableBody
                           className="h-2" emptyContent={
                           <Button size="sm" onPress={createNewMarker} startContent={<PlusIcon />}>
                              Create new marker
                           </Button>
                        }>
                           {markers.map((row: Marker, rowIndex: number) => (
                              <TableRow key={rowIndex} className="h-4">
                                 {markerColumns.map(column => (
                                    <TableCell key={column.key}>
                                       {renderCell(row, column.key, rowIndex)}
                                    </TableCell>
                                 ))}
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
                  </section>
                  <section className="pt-6">
                     <p className="mb-3 text-sm font-semibold uppercase text-white/45">Circle markers</p>
                     <Table
                        isHeaderSticky
                        data-testid="circle-markers-table"
                        className="overflow-auto max-h-[25vh]"
                        aria-label="Table of your circle markers"
                        color="primary">
                        <TableHeader>
                           {circleColumns.map(column => (
                              <TableColumn
                                 key={column.key}
                                 align={column.key === 'actions' ? 'center' : 'start'}
                              >
                                 {column.label}
                              </TableColumn>
                           ))}
                        </TableHeader>
                        <TableBody
                           className="h-2"
                           emptyContent={
                              <Button
                                 size="sm"
                                 onPress={createNewCircleMarker}
                                 startContent={<CircleIcon />}
                                 aria-label="Create new circle marker"
                              >
                                 Create new circle marker
                              </Button>
                           }
                        >
                           {circleMarkers.map((circleMarker: CircleMarker, rowIndex: number) => (
                              <TableRow key={circleMarker.id} className="h-4">
                                 {circleColumns.map(column => (
                                    <TableCell key={column.key}>
                                       {renderCircleCell(circleMarker, column.key, rowIndex)}
                                    </TableCell>
                                 ))}
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </section>
                  <input
                     ref={fileInputRef}
                     type="file"
                     accept=".json,application/json"
                     className="hidden"
                     aria-hidden="true"
                     onChange={handleFileInputChange}
                  />
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 mt-4">
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
                        onPress={createNewCircleMarker}
                        startContent={<PlusIcon />}
                        aria-label="Create new circle marker"
                     >
                        Create new circle marker
                     </Button>
                     <div className="h-5 w-px bg-white/10" />
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
                     <div className="h-5 w-px bg-white/10" />
                     <Button 
                        variant="bordered" 
                        size="sm" 
                        isDisabled={selectedRows.length !== 2}
                        onPress={() => {
                           const result = measureDistance(selectedRows)
                           if (result != null) {
                              showToast(`Distance: ${result.distanceKm.toFixed(2)} km`, 'info')
                           } else {
                              showToast('Invalid marker coordinates.', 'danger')
                           }
                        }}
                        startContent={<RulerIcon />}
                        aria-label="Measure distance"
                     >
                        Measure distance
                     </Button>
                     <Button 
                        variant="bordered" 
                        size="sm" 
                        isDisabled={selectedRows.length <= 1}
                        aria-label="Compute track with selected markers"
                     >
                        Compute track
                     </Button>
                  </div>
               </div>
            </div>
         </DrawerContent>
      </Drawer>
   )
}