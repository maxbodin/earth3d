import { Button } from '@nextui-org/react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import React, { useState } from 'react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { Feature, FeatureProperties, GeocodeResponse } from '@/app/types/orsTypes'
import { CompassIcon, PlusIcon } from 'lucide-react'
import { reverseORS } from '@/app/server/services/openRouteService'
import { ObjectType } from '@/app/enums/objectType'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { PlaceImageCarousel, } from '@/app/components/atoms/dataDisplay/placeDataDisplay/placeImageCarousel'
import { usePlaceImages, } from '@/app/components/atoms/dataDisplay/placeDataDisplay/usePlaceImages'
import { FieldItem } from '@/app/types/fieldItem'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { createMarkerFromPlaceFeature } from '@/app/lib/markerFactory'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { formatDisplayValues } from '@/lib/format/formatDisplayValues'
import { isFeature } from '@/lib/is/isFeature'
import { parsePlaceCoordinates } from '@/lib/parse/parsePlaceCoordinates'
import { getAntipodeCoordinates } from '@/lib/geo/getAntipodeCoordinates'
import { formatValue } from '@/lib/format/formatValue'
import { DETAILS_FOCUS_ZOOM_MULTIPLIER } from '@/app/constants/numbers'

export function PlaceDataDisplay(): React.JSX.Element {
   const {
      selectedObjectData,
      setSelectedObjectData,
      setSelectedObjectType,
   } = useSelection()
   const { setMarkers } = useMarkersDashboard()

   const { flyToCoordinates, flyToOppositeCoordinates } = CameraFlyController()

   if (!isFeature(selectedObjectData)) {
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )
   }

   const data: Feature = selectedObjectData

   const properties: FeatureProperties = data.properties
   const name: string = formatValue(properties.name)
   const label: string = formatValue(properties.label)
   const continent: string = formatValue(properties.continent)
   const country: string = formatValue(properties.country)
   const countryA: string = formatValue(properties.country_a)
   const county: string = formatValue(properties.county)
   const countyA: string = formatValue(properties.county_a)
   const region: string = formatValue(properties.region)

   const {
      hasValidCoordinates,
      latitude,
      longitude,
      strLatitude,
      strLongitude,
   } = parsePlaceCoordinates(data)

   const { imageUrls, imagesLoading } = usePlaceImages(
      latitude,
      longitude,
      hasValidCoordinates,
   )
   const [oppositePointLoading, setOppositePointLoading] = useState<boolean>(false)
   const [oppositePointError, setOppositePointError] = useState<string>('')

   const focusOnPlace = (): void => {
      if (!hasValidCoordinates) return

      flyToCoordinates(latitude, longitude, {
         zoomMultiplier: DETAILS_FOCUS_ZOOM_MULTIPLIER,
      })
   }

   const addPlaceToMarkers = (): void => {
      const marker = createMarkerFromPlaceFeature(data)
      if (marker == null) return

      setMarkers(prevMarkers => {
         return [...prevMarkers, marker]
      })
   }

   const focusOnOppositePoint = async (): Promise<void> => {
      if (!hasValidCoordinates || oppositePointLoading) return

      setOppositePointError('')
      setOppositePointLoading(true)
      flyToOppositeCoordinates(latitude, longitude)

      const antipodeCoordinates = getAntipodeCoordinates(
         latitude,
         longitude,
      )

      try {
         const response: GeocodeResponse = await reverseORS(
            antipodeCoordinates.longitude,
            antipodeCoordinates.latitude,
         )

         const oppositeFeature = response.features?.[0]

         if (oppositeFeature == null) {
            setOppositePointError('No place found at opposite point.')
            return
         }

         setSelectedObjectData(oppositeFeature)
         setSelectedObjectType(ObjectType.PLACE)
      } catch {
         setOppositePointError('Unable to fetch opposite point details.')
      } finally {
         setOppositePointLoading(false)
      }
   }

   const placeHeadlineFields: FieldItem[] = [
      {
         label: 'Name',
         value: name,
         prominent: true,
      },
      {
         label: 'Label',
         value: label,
      },
   ]

   const placeMetadataFields: FieldItem[] = [
      {
         label: 'Continent',
         value: continent,
      },
      {
         label: 'Country',
         value: formatDisplayValues(country, countryA, 'parens'),
      },
      {
         label: 'County',
         value: formatDisplayValues(county, countyA, 'parens'),
      },
      {
         label: 'Region',
         value: region,
      },
   ]

   const coordinatesFields: FieldItem[] = [
      {
         label: 'Longitude',
         value: strLongitude,
      },
      {
         label: 'Latitude',
         value: strLatitude,
      },
   ]

   return (
      <div className="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
         <DataSection title="Place" fields={placeHeadlineFields} />
         <DataSection title="Location" fields={placeMetadataFields} />
         <DataSection title="Coordinates" fields={coordinatesFields} />

         <PlaceImageCarousel imageUrls={imageUrls} imagesLoading={imagesLoading} />

         <section className="flex flex-wrap items-center gap-2 pt-1">
            {hasValidCoordinates && (
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Focus view on place."
                  className="z-50 bg-black/50"
                  endContent={<EyeIcon />}
                  onPress={focusOnPlace}
               >
                  Focus view on place
               </Button>
            )}

            {hasValidCoordinates && (
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Get to opposite point on Earth."
                  className="z-50 bg-black/50"
                  endContent={<CompassIcon className="h-4 w-4" />}
                  onPress={focusOnOppositePoint}
                  isLoading={oppositePointLoading}
               >
                  Focus opposite point
               </Button>
            )}

            {hasValidCoordinates && (
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Add place to markers"
                  className="z-50 bg-black/50"
                  endContent={<PlusIcon className="h-4 w-4" />}
                  onPress={addPlaceToMarkers}
               >
                  Add to markers
               </Button>
            )}
         </section>

         {oppositePointError.length > 0 && (
            <p className="text-xs text-rose-300">{oppositePointError}</p>
         )}
      </div>
   )
}
