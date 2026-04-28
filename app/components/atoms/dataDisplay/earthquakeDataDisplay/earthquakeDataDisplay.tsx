import React from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { N_A_VALUE } from '@/app/constants/strings'
import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'
import { FieldItem } from '@/app/types/fieldItem'
import { formatOptional } from '@/lib/format/formatOptional'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { Link } from '@/app/components/atoms/ui/link'
import { Button } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { isValidCoordinate } from '@/lib/isValid/isValidCoordinate'

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
      { label: 'Latitude', value: latitude?.toFixed(4) ?? N_A_VALUE },
      { label: 'Longitude', value: longitude?.toFixed(4) ?? N_A_VALUE },
      { label: 'Time', value: new Date(properties.time).toLocaleString() },
      { label: 'Updated', value: new Date(properties.updated).toLocaleString() },
   ]

   const detailFields: FieldItem[] = [
      ...(properties.felt != null ? [{ label: 'Felt reports', value: String(properties.felt) }] : []),
      ...(properties.cdi != null ? [{ label: 'Community Intensity (CDI)', value: String(properties.cdi) }] : []),
      ...(properties.mmi != null ? [{ label: 'Modified Mercalli (MMI)', value: String(properties.mmi) }] : []),
      { label: 'Status', value: properties.status },
      { label: 'Significance', value: String(properties.sig) },
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
   const hasValidCoordinates = isValidCoordinate(latitude, longitude)
   const { flyToCoordinates } = CameraFlyController()

   const focusOnPlace = (): void => {
      if (!hasValidCoordinates) return
      flyToCoordinates(latitude, longitude)
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
                  aria-label="Focus view on place."
                  className="z-50 bg-black/50"
                  endContent={<EyeIcon />}
                  onPress={focusOnPlace}
               >
                  Focus view on place
               </Button>
            )}
         </section>
      </div>
   )
}
