import React from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { N_A_VALUE } from '@/app/constants/strings'
import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'
import { FieldItem } from '@/app/types/fieldItem'
import { formatOptional } from '@/lib/format/formatOptional'
import { formatCoordinate } from '@/lib/format/formatCoordinate'
import { formatEpochToLocale } from '@/lib/format/formatEpochToLocale'
import { formatValue } from '@/lib/format/formatValue'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { Link } from '@/app/components/atoms/ui/link'
import { Button } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { isValidCoordinate } from '@/lib/isValid/isValidCoordinate'
import { DETAILS_FOCUS_ZOOM_MULTIPLIER } from '@/app/constants/numbers'

const ALERT_LEVEL_CLASSES: Record<string, string> = {
   red: 'text-red-500 font-bold',
   orange: 'text-orange-500 font-bold',
   yellow: 'text-yellow-500 font-bold',
   green: 'text-green-500 font-bold',
}

function buildEarthquakeFields(earthquake: UsgsEarthquakeFeature): {
   headlineFields: FieldItem[]
   coreFields: FieldItem[]
   coordinateFields: FieldItem[]
   detailFields: FieldItem[]
} {
   const { properties, geometry } = earthquake
   const [longitude, latitude, depth] = geometry.coordinates

   const magLabel = properties.magType
      ? `${formatOptional(properties.mag)} (${properties.magType})`
      : formatOptional(properties.mag)

   const headlineFields: FieldItem[] = [
      { label: 'Title', value: properties.title ?? N_A_VALUE, prominent: true },
   ]

   const coreFields: FieldItem[] = [
      { label: 'Magnitude', value: magLabel },
      { label: 'Depth', value: formatOptional(depth, ' km') },
      { label: 'Location', value: properties.place ?? N_A_VALUE },
   ]

   const coordinateFields: FieldItem[] = [
      { label: 'Latitude', value: formatCoordinate(latitude) },
      { label: 'Longitude', value: formatCoordinate(longitude) },
      { label: 'Time', value: formatEpochToLocale(properties.time) },
      { label: 'Updated', value: formatEpochToLocale(properties.updated) },
   ]

   const detailFields: FieldItem[] = [
      ...(properties.felt != null ? [{ label: 'Felt reports', value: formatValue(properties.felt) }] : []),
      ...(properties.cdi != null ? [{ label: 'Community Intensity (CDI)', value: formatValue(properties.cdi) }] : []),
      ...(properties.mmi != null ? [{ label: 'Modified Mercalli (MMI)', value: formatValue(properties.mmi) }] : []),
      { label: 'Status', value: properties.status },
      { label: 'Significance', value: formatValue(properties.sig) },
   ]

   return { headlineFields, coreFields, coordinateFields, detailFields }
}

export function EarthquakeDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()

   const earthquake = selectedObjectData as UsgsEarthquakeFeature | null

   if (earthquake == null || earthquake.properties == null) {
      return <h1>Failed to get earthquake data.</h1>
   }

   const { headlineFields, coreFields, coordinateFields, detailFields } = buildEarthquakeFields(earthquake)
   const { properties, geometry } = earthquake
   const [longitude, latitude] = geometry.coordinates
   const hasValidCoordinates = isValidCoordinate({ latitude: latitude, longitude: longitude })
   const { flyToCoordinates } = CameraFlyController()

   const focusOnEarthquake = (): void => {
      if (!hasValidCoordinates) return
      
      flyToCoordinates(latitude, longitude, {
         zoomMultiplier: DETAILS_FOCUS_ZOOM_MULTIPLIER,
      })
   }

   return (
      <div className="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
         <DataSection title="Earthquake" fields={headlineFields} />
         <DataSection title="Measurements" fields={coreFields} />
         <DataSection title="Coordinates" fields={coordinateFields} />
         <DataSection title="Details" fields={detailFields} />

         {properties.alert != null && (
            <p className={`text-sm font-medium ${ALERT_LEVEL_CLASSES[properties.alert] ?? 'text-green-500 font-bold'}`}>
               Alert Level: {properties.alert}
            </p>
         )}

         {properties.tsunami > 0 && (
            <p className="text-yellow-400 font-bold text-sm">
               ⚠ Tsunami warning issued
            </p>
         )}

         {properties.url && (
            <Link link={properties.url} title={'View on USGS'} />
         )}

         <section className="flex flex-wrap items-center gap-2 pt-1">
            {hasValidCoordinates && (
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Focus view on earthquake."
                  className="z-50 bg-black/50"
                  endContent={<EyeIcon />}
                  onPress={focusOnEarthquake}
               >
                  Focus view on earthquake
               </Button>
            )}
         </section>
      </div>
   )
}
