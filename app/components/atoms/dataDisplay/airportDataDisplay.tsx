import React from 'react'
import { getContinentEmoji, getContinentString, getTypeString } from '@/app/helpers/beautifyHelper'
import { N_A_VALUE } from '@/app/constants/strings'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { Button } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { updateCoordinatesInCurrentUrl } from '@/app/lib/coordinatesSearchParams'
import { formatCoordinate } from '@/lib/format/formatCoordinate'
import { formatValue } from '@/lib/format/formatValue'
import { formatDisplayValues } from '@/lib/format/formatDisplayValues'
import { resolveCountryEmojiByAlpha2, resolveCountryNameByAlpha2 } from '@/lib/format/formatCountryLookup'
import { FieldItem } from '@/app/types/fieldItem'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { Link } from '@/app/components/atoms/ui/link'
import { AirportAttributes } from '@/app/types/airport'
import { DETAILS_FOCUS_ZOOM_MULTIPLIER } from '@/app/constants/numbers'

function buildAirportFields(attr: AirportAttributes): {
   headlineFields: FieldItem[]
   locationFields: FieldItem[]
   codesFields: FieldItem[]
   coordinateFields: FieldItem[]
   physicalFields: FieldItem[]
   operationalFields: FieldItem[]
} {
   const countryEmoji = attr.iso_country ? resolveCountryEmojiByAlpha2(attr.iso_country) : ''
   const countryName = attr.iso_country ? resolveCountryNameByAlpha2(attr.iso_country) : N_A_VALUE

   const headlineFields: FieldItem[] = [
      { label: 'Name', value: formatValue(attr.name), prominent: true },
      { label: 'Type', value: attr.type ? getTypeString(attr.type) : N_A_VALUE },
      { label: 'Description', value: formatValue(attr.description) },
   ]

   const continentLabel = attr.continent
      ? formatDisplayValues(getContinentString(attr.continent), getContinentEmoji(attr.continent))
      : N_A_VALUE

   const locationFields: FieldItem[] = [
      { label: 'Continent', value: continentLabel },
      { label: 'Country', value: formatDisplayValues(countryName, countryEmoji) },
      { label: 'ISO Country', value: formatValue(attr.iso_country) },
      { label: 'ISO Region', value: formatValue(attr.iso_region) },
      { label: 'Municipality', value: formatValue(attr.municipality) },
   ]

   const codesFields: FieldItem[] = [
      { label: 'IATA Code', value: formatValue(attr.iata_code) },
      { label: 'IDENT', value: formatValue(attr.ident) },
      { label: 'Local Code', value: formatValue(attr.local_code) },
      { label: 'GPS Code', value: formatValue(attr.gps_code) },
   ]

   const coordinateFields: FieldItem[] = [
      { label: 'Latitude', value: formatCoordinate(attr.latitude_deg) },
      { label: 'Longitude', value: formatCoordinate(attr.longitude_deg) },
      { label: 'Elevation', value: attr.elevation_ft ? `${attr.elevation_ft} ft` : N_A_VALUE },
   ]

   const physicalFields: FieldItem[] = [
      { label: 'Length', value: attr.length_ft ? `${attr.length_ft} ft` : N_A_VALUE },
      { label: 'Width', value: attr.width_ft ? `${attr.width_ft} ft` : N_A_VALUE },
      { label: 'Surface', value: formatValue(attr.surface) },
      { label: 'Lighted', value: attr.lighted != null ? (Boolean(attr.lighted) ? 'Yes 💡' : 'No') : N_A_VALUE },
   ]

   const operationalFields: FieldItem[] = [
      { label: 'Closed', value: formatValue(attr.closed) },
      { label: 'Frequency', value: attr.frequency_mhz ? `${attr.frequency_mhz} MHz` : N_A_VALUE },
      { label: 'Scheduled Service', value: formatValue(attr.scheduled_service) },
   ]

   return { headlineFields, locationFields, codesFields, coordinateFields, physicalFields, operationalFields }
}

export function AirportDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()
   const { flyToCoordinates } = CameraFlyController()

   const attributes: AirportAttributes | undefined = selectedObjectData?.data?.attributes

   if (attributes == null) {
      return <h1>Failed to get data.</h1>
   }

   const { headlineFields, locationFields, codesFields, coordinateFields, physicalFields, operationalFields } =
      buildAirportFields(attributes)

   const latitude = Number.isFinite(attributes.latitude_deg) ? Number(attributes.latitude_deg) : null
   const longitude = Number.isFinite(attributes.longitude_deg) ? Number(attributes.longitude_deg) : null
   const hasValidCoordinates = latitude != null && longitude != null

   const focusOnAirport = (): void => {
      if (!hasValidCoordinates) return

      updateCoordinatesInCurrentUrl(latitude, longitude)
      
      flyToCoordinates(latitude, longitude, {
         zoomMultiplier: DETAILS_FOCUS_ZOOM_MULTIPLIER,
      })
   }

   const ident = attributes.ident
   const homeLink = attributes.home_link
   const wikipediaLink = attributes.wikipedia_link

   return (
      <div className="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
         <DataSection title="Airport" fields={headlineFields} />
         <DataSection title="Location" fields={locationFields} />
         <DataSection title="Codes" fields={codesFields} />
         <DataSection title="Coordinates" fields={coordinateFields} />
         <DataSection title="Physical" fields={physicalFields} />
         <DataSection title="Operations" fields={operationalFields} />

         {(ident || homeLink || wikipediaLink) && (
            <section className="space-y-1">
               {ident && <Link link={`https://metar-taf.com/${ident}`} title={`METAR-TAF ${ident}`} />}
               {homeLink && homeLink !== N_A_VALUE && <Link link={homeLink} title="Home Link" />}
               {wikipediaLink && wikipediaLink !== N_A_VALUE && <Link link={wikipediaLink} title="Wikipedia Link" />}
            </section>
         )}

         {hasValidCoordinates && (
            <section className="flex flex-wrap items-center gap-2 pt-1">
               <Button
                  variant="bordered"
                  size="sm"
                  aria-label="Focus view on airport."
                  className="z-50 bg-black/50"
                  endContent={<EyeIcon />}
                  onPress={focusOnAirport}
               >
                  Focus view on airport
               </Button>
            </section>
         )}
      </div>
   )
}
