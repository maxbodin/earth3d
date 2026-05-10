'use client'
import React, { useCallback, useState } from 'react'
import {
   Button,
   Input,
   Table,
   TableBody,
   TableCell,
   TableColumn,
   TableHeader,
   TableRow,
   Tooltip,
} from '@nextui-org/react'
import { DeleteIcon, EyeIcon } from '@nextui-org/shared-icons'
import { CircleMarker } from '@/app/types/circleMarker'
import { ColorPicker } from '@/shadcn/ui/colorPicker'
import { CrosshairIcon, PlusIcon } from 'lucide-react'
import { CIRCLE_RADIUS_SLIDER_STEP_KM, MAX_CIRCLE_RADIUS_KM, MIN_CIRCLE_RADIUS_KM, } from '@/app/constants/numbers'
import { parseNumberInput } from '@/lib/parse/parseNumberInput'
import { normalizeCircleRadiusKm } from '@/lib/normalize/normalizeCircleRadiusKm'
import { CoordinateField } from '@/lib/types/coordinateField'
import { getCoordinateErrorMessage } from '@/lib/error/getCoordinateErrorMessage'

type CircleColumnKey = keyof Pick<CircleMarker, 'name' | 'latitude' | 'longitude' | 'radiusKm' | 'color'> | 'actions'

const circleColumns: { key: CircleColumnKey, label: string }[] = [
   { key: 'name', label: 'Title' },
   { key: 'latitude', label: 'Center Latitude' },
   { key: 'longitude', label: 'Center Longitude' },
   { key: 'radiusKm', label: 'Radius (km)' },
   { key: 'color', label: 'Color' },
   { key: 'actions', label: 'Actions' },
]

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

interface CircleMarkersTableProps {
   circleMarkers: CircleMarker[]
   coordinateSelectionCircleId: string | null
   updateCircleMarker: (index: number, circleMarker: CircleMarker) => void
   deleteCircleMarker: (circleMarker: CircleMarker) => void
   focusCircleCenter: (circleMarker: CircleMarker) => void
   startCircleCenterSelection: (circleMarker: CircleMarker) => void
   createNewCircleMarker: () => void
   showToast: (message: string, tone: 'danger' | 'info') => void
}

export function CircleMarkersTable({
                                      circleMarkers,
                                      coordinateSelectionCircleId,
                                      updateCircleMarker,
                                      deleteCircleMarker,
                                      focusCircleCenter,
                                      startCircleCenterSelection,
                                      createNewCircleMarker,
                                      showToast,
                                   }: CircleMarkersTableProps): React.JSX.Element {
   const [coordinateErrors, setCoordinateErrors] = useState<Record<string, Partial<Record<CoordinateField, string>>>>({})
   const [circleRadiusErrors, setCircleRadiusErrors] = useState<Record<string, string>>({})

   const clearCoordinateError = useCallback((id: string, field: CoordinateField): void => {
      setCoordinateErrors(prev => {
         if (prev[id]?.[field] == null) return prev
         const next = { ...prev[id] }
         delete next[field]
         return { ...prev, [id]: next }
      })
   }, [])

   const setCoordinateError = useCallback((id: string, field: CoordinateField, msg: string): void => {
      setCoordinateErrors(prev => ({
         ...prev,
         [id]: { ...prev[id], [field]: msg },
      }))
   }, [])

   const commitCircleCoordinateInput = useCallback((
      circleMarker: CircleMarker,
      rowIndex: number,
      field: CoordinateField,
      rawValue: string,
   ): void => {
      const parsedValue = parseNumberInput(rawValue)
      const errorMessage = getCoordinateErrorMessage(field, parsedValue)

      if (parsedValue == null || errorMessage != null) {
         const msg = errorMessage ?? getCoordinateErrorMessage(field, null) ?? 'Coordinate must be a valid number.'
         setCoordinateError(circleMarker.id, field, msg)
         showToast(msg, 'danger')
         return
      }

      clearCoordinateError(circleMarker.id, field)
      updateCircleMarker(rowIndex, { ...circleMarker, [field]: parsedValue })
   }, [clearCoordinateError, setCoordinateError, showToast, updateCircleMarker])

   const updateCircleRadiusFromInput = useCallback((
      circleMarker: CircleMarker,
      rowIndex: number,
      rawValue: string,
   ): void => {
      const parsedValue = parseNumberInput(rawValue)
      const errorMessage = getCircleRadiusErrorMessage(parsedValue)

      if (parsedValue == null || errorMessage != null) {
         setCircleRadiusErrors(prev => ({
            ...prev,
            [circleMarker.id]: errorMessage ?? 'Radius must be a valid number.',
         }))
         return
      }

      setCircleRadiusErrors(prev => {
         if (prev[circleMarker.id] == null) return prev
         const next = { ...prev }
         delete next[circleMarker.id]
         return next
      })
      updateCircleMarker(rowIndex, { ...circleMarker, radiusKm: normalizeCircleRadiusKm(parsedValue) })
   }, [updateCircleMarker])

   const patchCircleMarker = useCallback((
      rowIndex: number,
      circleMarker: CircleMarker,
      patch: Partial<CircleMarker>,
   ): void => {
      updateCircleMarker(rowIndex, { ...circleMarker, ...patch })
   }, [updateCircleMarker])

   const renderCircleCell = useCallback((circleMarker: CircleMarker, cellKey: CircleColumnKey, rowIndex: number) => {
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
                     patchCircleMarker(rowIndex, circleMarker, { name: event.target.value })
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
                  onChange={(): void => { clearCoordinateError(circleMarker.id, 'latitude') }}
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
                  onChange={(): void => { clearCoordinateError(circleMarker.id, 'longitude') }}
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
                        const msg = circleRadiusErrors[circleMarker.id]
                        if (msg != null) showToast(msg, 'danger')
                     }}
                  />
               </div>
            )
         case 'color':
            return (
               <ColorPicker
                  onChange={(newColor: string): void => {
                     patchCircleMarker(rowIndex, circleMarker, { color: newColor })
                  }}
                  value={circleMarker.color}
               />
            )
         case 'actions': {
            const isCircleCenterSelectionArmed = coordinateSelectionCircleId === circleMarker.id

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
                        onPress={(): void => { startCircleCenterSelection(circleMarker) }}
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
         }
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

   return (
      <section className="pt-6">
         <p className="mb-3 text-sm font-semibold uppercase text-white/45">Circle markers</p>
         <Table
            isHeaderSticky
            data-testid="circle-markers-table"
            className="overflow-auto max-h-[10vh]"
            aria-label="Table of your circle markers"
            color="primary"
         >
            <TableHeader>
               {circleColumns.map(column => (
                  <TableColumn key={column.key} align={column.key === 'actions' ? 'center' : 'start'}>
                     {column.label}
                  </TableColumn>
               ))}
            </TableHeader>
            <TableBody
               emptyContent={
                  <Button size="sm" onPress={createNewCircleMarker} startContent={<PlusIcon />} aria-label="Create new circle marker">
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
   )
}
