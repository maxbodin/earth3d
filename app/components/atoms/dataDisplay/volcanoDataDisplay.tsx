import React from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { N_A_VALUE } from '@/app/constants/strings'
import { Volcano } from '@/app/types/volcano/volcano'
import { FieldItem } from '@/app/types/fieldItem'
import { formatCoordinate } from '@/lib/format/formatCoordinate'
import { formatOptional } from '@/lib/format/formatOptional'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { Button } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { isValidCoordinate } from '@/lib/isValid/isValidCoordinate'
import { DETAILS_FOCUS_ZOOM_MULTIPLIER } from '@/app/constants/numbers'

function buildVolcanoFields(volcano: Volcano): {
   headlineFields: FieldItem[]
   coreFields: FieldItem[]
   coordinateFields: FieldItem[]
   historyFields: FieldItem[]
} {
   const headlineFields: FieldItem[] = [
      { label: 'Name', value: volcano.name ?? N_A_VALUE, prominent: true },
   ]

   const coreFields: FieldItem[] = [
      { label: 'Type', value: volcano.type ?? N_A_VALUE },
      { label: 'Country', value: volcano.country ?? N_A_VALUE },
      { label: 'Region', value: volcano.region ?? N_A_VALUE },
      { label: 'Elevation', value: formatOptional(volcano.elevationMeters, ' m') },
   ]

   const coordinateFields: FieldItem[] = [
      { label: 'Latitude', value: formatCoordinate(volcano.latitude) },
      { label: 'Longitude', value: formatCoordinate(volcano.longitude) },
   ]

   const historyFields: FieldItem[] = [
      { label: 'Last eruption', value: volcano.lastEruptionYear != null ? String(volcano.lastEruptionYear) : N_A_VALUE },
      { label: 'Recorded eruptions', value: String(volcano.eruptionCount) },
   ]

   return { headlineFields, coreFields, coordinateFields, historyFields }
}

export function VolcanoDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()

   const volcano = selectedObjectData as Volcano | null

   if (volcano == null) {
      return <h1>Failed to get volcano data.</h1>
   }

   const { headlineFields, coreFields, coordinateFields, historyFields } = buildVolcanoFields(volcano)
   const hasValidCoordinates = isValidCoordinate({ latitude: volcano.latitude, longitude: volcano.longitude })
   const { flyToCoordinates } = CameraFlyController()

   // TODO : Refactor this part and the button part in a reusable component and refactor other implementations.
   const focusOnVolcano = (): void => {
      if (!hasValidCoordinates) return

      flyToCoordinates(volcano.latitude, volcano.longitude, {
         zoomMultiplier: DETAILS_FOCUS_ZOOM_MULTIPLIER,
      })
   }

   return (
      <div className="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
         <DataSection title="Volcano" fields={headlineFields} />
         <DataSection title="Information" fields={coreFields} />
         <DataSection title="Coordinates" fields={coordinateFields} />
         <DataSection title="Eruption History" fields={historyFields} />

         <section className="flex flex-wrap items-center gap-2 pt-1">
            {hasValidCoordinates && (
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Focus view on volcano."
                  className="z-50 bg-black/50"
                  endContent={<EyeIcon />}
                  onPress={focusOnVolcano}
               >
                  Focus view on volcano
               </Button>
            )}
         </section>
      </div>
   )
}
