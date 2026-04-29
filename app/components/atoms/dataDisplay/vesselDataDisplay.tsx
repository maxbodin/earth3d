import React from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { Button } from '@nextui-org/react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { EyeIcon } from '@nextui-org/shared-icons'
import { parseCoordinatesFromUnknown } from '@/lib/parse/parseCoordinates'
import { formatCoordinate } from '@/lib/format/formatCoordinate'
import { formatValue } from '@/lib/format/formatValue'
import { FieldItem } from '@/app/types/fieldItem'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { Coordinates } from '@/app/types/coordinates/coordinates'
import { DETAILS_FOCUS_ZOOM_MULTIPLIER } from '@/app/constants/numbers'
import { VesselMessage } from '@/app/types/vesselMessage'

function buildVesselFields(
   message: VesselMessage,
   coordinates: Coordinates | null,
): {
   headlineFields: FieldItem[]
   navigationFields: FieldItem[]
   coordinateFields: FieldItem[]
   technicalFields: FieldItem[]
} {
   const headlineFields: FieldItem[] = [
      { label: 'Vessel Name', value: formatValue(message.name), prominent: true },
      { label: 'MMSI', value: formatValue(message.mmsi) },
      { label: 'Callsign', value: formatValue(message.callsign) },
      { label: 'IMO', value: formatValue(message.imo) },
   ]

   const navigationFields: FieldItem[] = [
      { label: 'Destination', value: formatValue(message.destination) },
      { label: 'ETA', value: formatValue(message.eta) },
      { label: 'Course Over Ground', value: formatValue(message.cog) },
      { label: 'Speed Over Ground', value: formatValue(message.sog) },
      { label: 'Ship Heading', value: formatValue(message.hdg) },
   ]

   const coordinateFields: FieldItem[] = [
      { label: 'Latitude', value: formatCoordinate(coordinates?.latitude) },
      { label: 'Longitude', value: formatCoordinate(coordinates?.longitude) },
      { label: 'Last Communication', value: formatValue(message.time_utc) },
   ]

   const dimension = message.dimension != null
      ? JSON.stringify(message.dimension)
      : null

   const technicalFields: FieldItem[] = [
      { label: 'Cargo Type Code', value: formatValue(message.cargo_type_code) },
      { label: 'Dimension', value: formatValue(dimension) },
   ]

   return { headlineFields, navigationFields, coordinateFields, technicalFields }
}

export function VesselDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()
   const { flyToCoordinates } = CameraFlyController()

   const message: VesselMessage | undefined = selectedObjectData?.message

   if (message == null) {
      return <h1>Failed to get data.</h1>
   }

   const coordinates = parseCoordinatesFromUnknown(message.location?.coordinates)
   const { headlineFields, navigationFields, coordinateFields, technicalFields } =
      buildVesselFields(message, coordinates)

   const hasValidCoordinates = coordinates != null

   const focusOnVessel = (): void => {
      if (coordinates == null) return

      flyToCoordinates(coordinates.latitude, coordinates.longitude, {
         zoomMultiplier: DETAILS_FOCUS_ZOOM_MULTIPLIER,
      })
   }

   return (
      <div className="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
         <DataSection title="Vessel" fields={headlineFields} />
         <DataSection title="Navigation" fields={navigationFields} />
         <DataSection title="Position" fields={coordinateFields} />
         <DataSection title="Technical" fields={technicalFields} />

         {hasValidCoordinates && (
            <section className="flex flex-wrap items-center gap-2 pt-1">
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Focus view on vessel."
                  className="z-50 bg-black/50"
                  endContent={<EyeIcon />}
                  onPress={focusOnVessel}
               >
                  Focus view on vessel
               </Button>
            </section>
         )}
      </div>
   )
}
