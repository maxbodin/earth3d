'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useUi } from '@/app/context/uiContext'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import { Button } from '@nextui-org/react'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { CloseIcon } from '@nextui-org/shared-icons'
import { Marker } from '@/app/types/marker'
import { CircleMarker } from '@/app/types/circleMarker'
import { MarkersDashboardController } from '@/app/components/organisms/markersDashboard/markersDashboard.controller'
import { GeocodeResponse } from '@/app/types/orsTypes'
import { DownloadIcon, PlusIcon, RulerIcon, UploadIcon } from 'lucide-react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { CursorModeType } from '@/app/enums/modeType'
import { reverseORS } from '@/app/server/services/openRouteService'
import { ObjectType } from '@/app/enums/objectType'
import { isValidCoordinate } from '@/lib/isValid/isValidCoordinate'
import { MarkersTable } from '@/app/components/organisms/markersDashboard/markersTable'
import { CircleMarkersTable } from '@/app/components/organisms/markersDashboard/circleMarkersTable'

type ToastTone = 'danger' | 'info'

interface MarkerToast {
   message: string
   tone: ToastTone
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
      flyToCoordinates(marker.latitude, marker.longitude)

      try {
         const data: GeocodeResponse = await reverseORS(marker.longitude, marker.latitude)
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
   }, [flyToCoordinates, handleMarkersDashboardClose, setSelectedObjectData, setSelectedObjectType, showToast])

   const focusCircleCenter = useCallback((circleMarker: CircleMarker): void => {
      if (!isValidCoordinate({ latitude: circleMarker.latitude, longitude: circleMarker.longitude })) {
         showToast('Circle center coordinates are invalid.', 'danger')
         return
      }
      handleMarkersDashboardClose()
      flyToCoordinates(circleMarker.latitude, circleMarker.longitude)
   }, [flyToCoordinates, handleMarkersDashboardClose, showToast])

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
                  <MarkersTable
                     markers={markers}
                     areMarkerTitlesVisible={areMarkerTitlesVisible}
                     setAreMarkerTitlesVisible={setAreMarkerTitlesVisible}
                     coordinateSelectionMarkerId={coordinateSelectionMarkerId}
                     featureSuggestions={featureSuggestions}
                     autoCompleteLoading={autoCompleteLoading}
                     isDragOver={isDragOver}
                     selectMarker={selectMarker}
                     updateMarker={updateMarker}
                     deleteMarker={deleteMarker}
                     onInputChange={onInputChange}
                     onSelectionChange={onSelectionChange}
                     onCoordsChange={onCoordsChange}
                     focusMarkerAndDisplayPlace={focusMarkerAndDisplayPlace}
                     startMapCoordinateSelection={startMapCoordinateSelection}
                     createNewMarker={createNewMarker}
                     showToast={showToast}
                     onDrop={handleDrop}
                     onDragOver={handleDragOver}
                     onDragLeave={handleDragLeave}
                  />
                  <CircleMarkersTable
                     circleMarkers={circleMarkers}
                     coordinateSelectionCircleId={coordinateSelectionCircleId}
                     updateCircleMarker={updateCircleMarker}
                     deleteCircleMarker={deleteCircleMarker}
                     focusCircleCenter={focusCircleCenter}
                     startCircleCenterSelection={startCircleCenterSelection}
                     createNewCircleMarker={createNewCircleMarker}
                     showToast={showToast}
                  />
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