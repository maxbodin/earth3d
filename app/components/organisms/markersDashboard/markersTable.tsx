'use client'
import React, { useCallback, useState } from 'react'
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
import { DeleteIcon, EyeIcon } from '@nextui-org/shared-icons'
import { Marker } from '@/app/types/marker'
import { ColorPicker } from '@/shadcn/ui/colorPicker'
import { AutoComplete, Option } from '@/shadcn/ui/autocomplete'
import { Feature } from '@/app/types/orsTypes'
import { CrosshairIcon, Eye as VisibilityOnIcon, EyeOff as VisibilityOffIcon, PlusIcon, } from 'lucide-react'
import { PUCK_COLOR } from '@/app/constants/colors'
import { parseNumberInput } from '@/lib/parse/parseNumberInput'
import { getCoordinateErrorMessage } from '@/lib/error/getCoordinateErrorMessage'
import { CoordinateField } from '@/lib/types/coordinatesField'

type MarkerColumnKey = 'selection' | 'name' | 'address' | 'latitude' | 'longitude' | 'color' | 'actions'

const markerColumns: { key: MarkerColumnKey, label: string }[] = [
   { key: 'selection', label: 'Selection' },
   { key: 'name', label: 'Title' },
   { key: 'address', label: 'Address' },
   { key: 'latitude', label: 'Latitude' },
   { key: 'longitude', label: 'Longitude' },
   { key: 'color', label: 'Color' },
   { key: 'actions', label: 'Actions' },
]

interface MarkersTableProps {
   markers: Marker[]
   areMarkerTitlesVisible: boolean
   setAreMarkerTitlesVisible: (value: boolean) => void
   coordinateSelectionMarkerId: string | null
   featureSuggestions: Feature[]
   autoCompleteLoading: boolean
   isDragOver: boolean
   selectMarker: (marker: Marker) => void
   updateMarker: (index: number, marker: Marker) => void
   deleteMarker: (marker: Marker) => void
   onInputChange: (value: string) => void
   onSelectionChange: (option: Option, marker: Marker) => void
   onCoordsChange: (marker: Marker) => void
   focusMarkerAndDisplayPlace: (marker: Marker) => Promise<void>
   startMapCoordinateSelection: (marker: Marker) => void
   createNewMarker: () => void
   showToast: (message: string, tone: 'danger' | 'info') => void
   onDrop: (event: React.DragEvent<HTMLDivElement>) => void
   onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
   onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
}

export function MarkersTable({
                                markers,
                                areMarkerTitlesVisible,
                                setAreMarkerTitlesVisible,
                                coordinateSelectionMarkerId,
                                featureSuggestions,
                                autoCompleteLoading,
                                isDragOver,
                                selectMarker,
                                updateMarker,
                                deleteMarker,
                                onInputChange,
                                onSelectionChange,
                                onCoordsChange,
                                focusMarkerAndDisplayPlace,
                                startMapCoordinateSelection,
                                createNewMarker,
                                showToast,
                                onDrop,
                                onDragOver,
                                onDragLeave,
                             }: MarkersTableProps): React.JSX.Element {
   const [coordinateErrors, setCoordinateErrors] = useState<Record<string, Partial<Record<CoordinateField, string>>>>({})

   const setCoordinateError = useCallback((
      markerId: string,
      field: CoordinateField,
      errorMessage: string,
   ): void => {
      setCoordinateErrors(prev => ({
         ...prev,
         [markerId]: { ...prev[markerId], [field]: errorMessage },
      }))
   }, [])

   const clearCoordinateError = useCallback((markerId: string, field: CoordinateField): void => {
      setCoordinateErrors(prev => {
         if (prev[markerId]?.[field] == null) return prev
         const next = { ...prev[markerId] }
         delete next[field]
         return { ...prev, [markerId]: next }
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
         const msg = errorMessage ?? getCoordinateErrorMessage(field, null) ?? 'Coordinate must be a valid number.'
         setCoordinateError(marker.id, field, msg)
         showToast(msg, 'danger')
         return
      }

      clearCoordinateError(marker.id, field)

      const updatedMarker: Marker = { ...marker, [field]: parsedValue }
      updateMarker(rowIndex, updatedMarker)
      onCoordsChange(updatedMarker)
   }, [clearCoordinateError, onCoordsChange, setCoordinateError, showToast, updateMarker])

   const patchMarker = useCallback((
      rowIndex: number,
      marker: Marker,
      patch: Partial<Marker>,
   ): void => {
      updateMarker(rowIndex, { ...marker, ...patch })
   }, [updateMarker])

   const renderCell = useCallback((marker: Marker, cellKey: MarkerColumnKey, rowIndex: number) => {
      const markerId = marker.id

      switch (cellKey) {
         case 'selection':
            return (
               <Checkbox onValueChange={(): void => selectMarker(marker)} />
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
                     patchMarker(rowIndex, marker, { name: event.target.value })
                  }}
               />
            )
         case 'address': {
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

            const value: Option = { label: marker.address, value: marker.address }

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
         }
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
                  onChange={(): void => { clearCoordinateError(markerId, 'latitude') }}
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
                  onChange={(): void => { clearCoordinateError(markerId, 'longitude') }}
                  onBlur={(event: React.FocusEvent<HTMLInputElement>): void => {
                     commitCoordinateInput(marker, rowIndex, 'longitude', event.target.value)
                  }}
               />
            )
         case 'color':
            return (
               <ColorPicker
                  onChange={(newColor: string): void => {
                     patchMarker(rowIndex, marker, { color: newColor })
                  }}
                  isDisabled={marker.isPuck}
                  value={marker.isPuck ? PUCK_COLOR : marker.color}
               />
            )
         case 'actions': {
            const isCoordinateSelectionArmed = coordinateSelectionMarkerId === markerId
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
                  {!marker.isPuck && (
                     <Tooltip content={isCoordinateSelectionArmed ? 'Coordinate picker enabled' : 'Pick coordinates on map'}>
                        <Button
                           isIconOnly
                           size="sm"
                           variant="light"
                           data-map-pick-ignore="true"
                           aria-label="Pick coordinates on map"
                           className={isCoordinateSelectionArmed ? 'text-primary' : 'text-default-400'}
                           onPress={(): void => { startMapCoordinateSelection(marker) }}
                        >
                           <CrosshairIcon className="h-[1em] w-[1em]" />
                        </Button>
                     </Tooltip>
                  )}
                  <Tooltip content={marker.showTitleOnMap ? 'Hide title on map' : 'Show title on map'}>
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
                           patchMarker(rowIndex, marker, { showTitleOnMap: !marker.showTitleOnMap })
                        }}
                     >
                        {marker.showTitleOnMap ? (
                           <VisibilityOnIcon className="h-[1em] w-[1em]" />
                        ) : (
                           <VisibilityOffIcon className="h-[1em] w-[1em]" />
                        )}
                     </Button>
                  </Tooltip>
                  {!marker.isPuck && (
                     <Tooltip color="danger" content="Delete marker">
                        <Button isIconOnly size="sm" variant="light" aria-label="Delete marker" className="text-danger" onPress={(): void => {
                           deleteMarker(marker)
                        }}>
                           <DeleteIcon />
                        </Button>
                     </Tooltip>
                  )}
               </div>
            )
         }
         default:
            return null
      }
   }, [
      autoCompleteLoading,
      clearCoordinateError,
      commitCoordinateInput,
      coordinateErrors,
      coordinateSelectionMarkerId,
      deleteMarker,
      featureSuggestions,
      focusMarkerAndDisplayPlace,
      onInputChange,
      onSelectionChange,
      patchMarker,
      selectMarker,
      startMapCoordinateSelection,
   ])

   return (
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
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
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
               color="primary"
            >
               <TableHeader>
                  {markerColumns.map(column =>
                     <TableColumn key={column.key} align={column.key === 'actions' ? 'center' : 'start'}>
                        {column.label}
                     </TableColumn>,
                  )}
               </TableHeader>
               <TableBody
                  className="h-2"
                  emptyContent={
                     <Button size="sm" onPress={createNewMarker} startContent={<PlusIcon />}>
                        Create new marker
                     </Button>
                  }
               >
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
   )
}
