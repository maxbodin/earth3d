import React from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { Country } from '@/app/types/countryType'
import { N_A_VALUE } from '@/app/constants/strings'
import { PlaceField } from '@/app/components/atoms/dataDisplay/placeDataDisplay/placeField'
import { PlaceFieldItem } from '@/app/types/placeFieldItem'
import { Button } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'

const lookup = require('country-data').lookup

function isCountrySelection(selection: unknown): selection is Country {
   if (selection == null || typeof selection !== 'object') {
      return false
   }

   const maybeCountry = selection as Partial<Country>

   return (
      typeof maybeCountry.country === 'string'
      && typeof maybeCountry.alpha2 === 'string'
      && typeof maybeCountry.alpha3 === 'string'
      && typeof maybeCountry.numeric === 'number'
      && typeof maybeCountry.latitude === 'number'
      && typeof maybeCountry.longitude === 'number'
   )
}

function formatCoordinate(value: number): string {
   return Number.isFinite(value) ? value.toFixed(3) : N_A_VALUE
}

export function CountryDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()
   const { flyToCoordinates } = CameraFlyController()

   if (!isCountrySelection(selectedObjectData)) {
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )
   }

   const country = selectedObjectData
   const countryEmoji = lookup?.countries({ alpha2: country.alpha2 })[0]?.emoji ?? ''

   const countryFields: PlaceFieldItem[] = [
      {
         label: 'Country',
         value: countryEmoji.length > 0
            ? `${country.country} ${countryEmoji}`
            : country.country,
         prominent: true,
      },
      {
         label: 'Alpha-2',
         value: country.alpha2,
      },
      {
         label: 'Alpha-3',
         value: country.alpha3,
      },
      {
         label: 'Numeric',
         value: String(country.numeric),
      },
   ]

   const coordinatesFields: PlaceFieldItem[] = [
      {
         label: 'Latitude',
         value: formatCoordinate(country.latitude),
      },
      {
         label: 'Longitude',
         value: formatCoordinate(country.longitude),
      },
   ]

   const canFocusOnCountry =
      Number.isFinite(country.latitude) && Number.isFinite(country.longitude)

   const focusOnCountry = (): void => {
      if (!canFocusOnCountry) {
         return
      }

      flyToCoordinates(country.latitude, country.longitude)
   }

   return (
      <div className="w-full min-w-0 max-w-full space-y-4 overflow-x-hidden">
         <section className="space-y-1">
            {countryFields.map((field: PlaceFieldItem) => (
               <PlaceField
                  key={field.label}
                  label={field.label}
                  value={field.value}
                  prominent={field.prominent}
               />
            ))}
         </section>

         <section className="space-y-1">
            {coordinatesFields.map((field: PlaceFieldItem) => (
               <PlaceField
                  key={field.label}
                  label={field.label}
                  value={field.value}
               />
            ))}
         </section>

         <section className="flex flex-wrap items-center gap-2 pt-1">
            <Button
               variant="bordered"
               size="sm"
               aria-label="Focus view on country"
               className="z-50 bg-black/50"
               endContent={<EyeIcon />}
               onPress={focusOnCountry}
               isDisabled={!canFocusOnCountry}
            >
               Focus view on country
            </Button>
         </section>
      </div>
   )
}
