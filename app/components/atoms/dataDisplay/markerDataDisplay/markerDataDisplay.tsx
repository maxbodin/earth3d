import React, { useCallback, useState } from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { Marker } from '@/app/types/marker'
import { FieldItem } from '@/app/types/fieldItem'
import { N_A_VALUE } from '@/app/constants/strings'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { Button } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { MapPinIcon, Trash2Icon } from 'lucide-react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { isValidCoordinate } from '@/lib/isValid/isValidCoordinate'
import { ObjectType } from '@/app/enums/objectType'
import { reverseORS } from '@/app/server/services/openRouteService'
import { GeocodeResponse } from '@/app/types/orsTypes'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { formatCoordinate } from '@/lib/format/formatCoordinate'

function buildMarkerFields(marker: Marker): {
   headlineFields: FieldItem[]
   locationFields: FieldItem[]
   coordinateFields: FieldItem[]
} {
   const headlineFields: FieldItem[] = [
      { label: 'Name', value: marker.name || N_A_VALUE, prominent: true },
   ]

   const locationFields: FieldItem[] = [
      { label: 'Address', value: marker.address || N_A_VALUE },
   ]

   const coordinateFields: FieldItem[] = [
      { label: 'Latitude', value: formatCoordinate(marker.latitude) },
      { label: 'Longitude', value: formatCoordinate(marker.longitude) },
   ]

   return { headlineFields, locationFields, coordinateFields }
}

export function MarkerDataDisplay(): React.JSX.Element {
   const { selectedObjectData, setSelectedObjectData, setSelectedObjectType } = useSelection()
   const { flyToCoordinates } = CameraFlyController()
   const { setMarkers } = useMarkersDashboard()

   const [placeLoading, setPlaceLoading] = useState(false)
   const [placeError, setPlaceError] = useState('')

   const marker = selectedObjectData as Marker | null

   if (marker == null) {
      return <h1>Failed to get marker data.</h1>
   }

   const { headlineFields, locationFields, coordinateFields } = buildMarkerFields(marker)
   const hasValidCoordinates = isValidCoordinate(marker.latitude, marker.longitude)

   const focusOnMarker = (): void => {
      if (!hasValidCoordinates) return
      flyToCoordinates(marker.latitude, marker.longitude)
   }

   const viewPlaceData = useCallback(async (): Promise<void> => {
      if (!hasValidCoordinates || placeLoading) return

      setPlaceError('')
      setPlaceLoading(true)

      try {
         const data: GeocodeResponse = await reverseORS(marker.longitude, marker.latitude)
         const placeFeature = data.features?.[0]

         if (placeFeature == null) {
            setPlaceError('No place found at marker location.')
            return
         }

         setSelectedObjectData(placeFeature)
         setSelectedObjectType(ObjectType.PLACE)
      } catch {
         setPlaceError('Unable to fetch place details.')
      } finally {
         setPlaceLoading(false)
      }
   }, [hasValidCoordinates, placeLoading, marker.longitude, marker.latitude, setSelectedObjectData, setSelectedObjectType])

   const deleteMarker = useCallback((): void => {
      setMarkers(prev => prev.filter(m => m.id !== marker.id))
      setSelectedObjectData({})
      setSelectedObjectType(ObjectType.NULL)
   }, [marker.id, setMarkers, setSelectedObjectData, setSelectedObjectType])

   return (
      <div className="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
         <DataSection title="Marker" fields={headlineFields} />
         <DataSection title="Location" fields={locationFields} />
         <DataSection title="Coordinates" fields={coordinateFields} />

         {hasValidCoordinates && (
            <section className="flex flex-wrap items-center gap-2 pt-1">
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Focus view on marker."
                  className="z-50 bg-black/50"
                  endContent={<EyeIcon />}
                  onPress={focusOnMarker}
               >
                  Focus view on marker
               </Button>

               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="View place data at marker location."
                  className="z-50 bg-black/50"
                  endContent={<MapPinIcon className="h-4 w-4" />}
                  onPress={viewPlaceData}
                  isLoading={placeLoading}
               >
                  View place data
               </Button>

               {!marker.isPuck && (
                  <Button
                     variant="bordered"
                     size="sm"
                     aria-label="Delete marker."
                     className="z-50 bg-black/50"
                     color="danger"
                     endContent={<Trash2Icon className="h-4 w-4" />}
                     onPress={deleteMarker}
                  >
                     Delete marker
                  </Button>
               )}
            </section>
         )}

         {placeError.length > 0 && (
            <p className="text-xs text-rose-300">{placeError}</p>
         )}
      </div>
   )
}
