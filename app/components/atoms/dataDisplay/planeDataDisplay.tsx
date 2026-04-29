import React from 'react'
import { N_A_VALUE } from '@/app/constants/strings'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { parseSelectedPlaneStateVector } from '@/lib/parse/parseSelectedPlaneStateVector'
import { formatTimestamp } from '@/lib/format/formatTimestamp'
import { formatValue } from '@/lib/format/formatValue'
import { formatCoordinate } from '@/lib/format/formatCoordinate'
import { Button } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { isValidCoordinate } from '@/lib/isValid/isValidCoordinate'
import { resolveCountryEmojiByName } from '@/lib/format/formatCountryLookup'
import { formatDisplayValues } from '@/lib/format/formatDisplayValues'
import { FieldItem } from '@/app/types/fieldItem'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { DETAILS_FOCUS_ZOOM_MULTIPLIER } from '@/app/constants/numbers'

function buildPlaneFields(state: OpenSkyStateVector): {
   headlineFields: FieldItem[]
   originFields: FieldItem[]
   positionFields: FieldItem[]
   flightFields: FieldItem[]
   metaFields: FieldItem[]
} {
   const [
      icao24, callsign, originCountry, timePosition, lastContact,
      longitude, latitude, baroAltitude, onGround, velocity,
      trueTrack, verticalRate, sensors, geoAltitude, squawk,
      spi, positionSource, category,
   ] = state

   const countryEmoji = originCountry ? resolveCountryEmojiByName(originCountry) : ''
   const countryLabel = originCountry
      ? formatDisplayValues(originCountry, countryEmoji)
      : N_A_VALUE

   const headlineFields: FieldItem[] = [
      { label: 'Callsign', value: formatValue(callsign), prominent: true },
      { label: 'ICAO24', value: formatValue(icao24) },
      { label: 'Origin Country', value: countryLabel },
   ]

   const originFields: FieldItem[] = [
      { label: 'Time Position', value: formatTimestamp(timePosition) },
      { label: 'Last Contact', value: formatTimestamp(lastContact) },
   ]

   const positionFields: FieldItem[] = [
      { label: 'Latitude', value: formatCoordinate(latitude) },
      { label: 'Longitude', value: formatCoordinate(longitude) },
      { label: 'Barometric Altitude', value: formatValue(baroAltitude) },
      { label: 'Geometric Altitude', value: formatValue(geoAltitude) },
      { label: 'On Ground', value: onGround ? 'Yes' : 'No' },
   ]

   const flightFields: FieldItem[] = [
      { label: 'Velocity', value: formatValue(velocity) },
      { label: 'True Track', value: formatValue(trueTrack) },
      { label: 'Vertical Rate', value: formatValue(verticalRate) },
   ]

   const formattedSensors = sensors == null || sensors.length === 0
      ? N_A_VALUE
      : sensors.join(', ')

   const metaFields: FieldItem[] = [
      { label: 'Squawk', value: formatValue(squawk) },
      { label: 'SPI', value: spi ? 'Yes' : 'No' },
      { label: 'Position Source', value: formatValue(positionSource) },
      { label: 'Category', value: formatValue(category) },
      { label: 'Sensors', value: formattedSensors },
   ]

   return { headlineFields, originFields, positionFields, flightFields, metaFields }
}

export function PlaneDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()
   const { flyToCoordinates } = CameraFlyController()

   const stateVector = parseSelectedPlaneStateVector(selectedObjectData)

   if (stateVector == null) {
      return <h1>Failed to get data.</h1>
   }

   const { headlineFields, originFields, positionFields, flightFields, metaFields } = buildPlaneFields(stateVector)

   const latitude = stateVector[6]
   const longitude = stateVector[5]
   const hasValidCoordinates = latitude != null && longitude != null && isValidCoordinate({ latitude: latitude, longitude: longitude })

   const focusOnPlane = (): void => {
      if (!hasValidCoordinates) return
      
      flyToCoordinates(latitude, longitude, {
         zoomMultiplier: DETAILS_FOCUS_ZOOM_MULTIPLIER,
      })
   }

   return (
      <div className="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
         <DataSection title="Aircraft" fields={headlineFields} />
         <DataSection title="Timing" fields={originFields} />
         <DataSection title="Position" fields={positionFields} />
         <DataSection title="Flight Data" fields={flightFields} />
         <DataSection title="Metadata" fields={metaFields} />

         {hasValidCoordinates && (
            <section className="flex flex-wrap items-center gap-2 pt-1">
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Focus view on plane."
                  className="z-50 bg-black/50"
                  endContent={<EyeIcon />}
                  onPress={focusOnPlane}
               >
                  Focus view on plane
               </Button>
            </section>
         )}
      </div>
   )
}
