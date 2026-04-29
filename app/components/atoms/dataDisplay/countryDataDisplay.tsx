import React, { useEffect, useMemo, useState } from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { Country } from '@/app/types/countryType'
import { COUNTRY_PROFILE_API_BASE_PATH, N_A_VALUE } from '@/app/constants/strings'
import { FieldItem } from '@/app/types/fieldItem'
import { Button } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { CountryProfile } from '@/app/types/countryProfile'
import { formatCoordinate } from '@/lib/format/formatCoordinate'
import { formatNumber } from '@/lib/format/formatNumber'
import { formatList } from '@/lib/format/formatList'
import { formatDecimal } from '@/lib/format/formatDecimal'
import { formatCurrencies } from '@/lib/format/formatCurrencies'
import { formatLanguages } from '@/lib/format/formatLanguages'
import { formatRegionalBlocs } from '@/lib/format/formatRegionalBlocs'
import { formatTranslations } from '@/lib/format/formatTranslations'
import { resolveCountryEmojiByAlpha2 } from '@/lib/format/formatCountryLookup'
import { formatDisplayValues } from '@/lib/format/formatDisplayValues'
import { DataSection } from '@/app/components/atoms/ui/dataSection'
import { DETAILS_FOCUS_ZOOM_MULTIPLIER } from '@/app/constants/numbers'

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

function buildCountryProfileRequestUrl(country: Country): string {
   const queryParams = new URLSearchParams({
      name: country.country,
      alpha3: country.alpha3,
      numeric: String(country.numeric),
      lat: String(country.latitude),
      lon: String(country.longitude),
   })

   return `${COUNTRY_PROFILE_API_BASE_PATH}/${encodeURIComponent(country.alpha2)}?${queryParams.toString()}`
}

export function CountryDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()
   const { flyToCoordinates } = CameraFlyController()

   const [countryProfile, setCountryProfile] = useState<CountryProfile | null>(null)
   const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false)
   const [profileError, setProfileError] = useState<string | null>(null)

   const selectedCountry = isCountrySelection(selectedObjectData)
      ? selectedObjectData
      : null

   useEffect((): (() => void) | void => {
      if (selectedCountry == null) {
         setCountryProfile(null)
         setIsProfileLoading(false)
         setProfileError(null)
         return
      }

      const abortController = new AbortController()

      setIsProfileLoading(true)
      setProfileError(null)

      fetch(buildCountryProfileRequestUrl(selectedCountry), {
         method: 'GET',
         cache: 'no-store',
         signal: abortController.signal,
      })
         .then(async response => {
            if (!response.ok) {
               throw new Error(`Country profile request failed (${response.status})`)
            }

            return await response.json() as CountryProfile
         })
         .then(profile => {
            setCountryProfile(profile)
            setIsProfileLoading(false)
         })
         .catch((error: unknown) => {
            if (
               error != null
               && typeof error === 'object'
               && 'name' in error
               && error.name === 'AbortError'
            ) {
               return
            }

            setCountryProfile(null)
            setIsProfileLoading(false)
            setProfileError('Live country profile is temporarily unavailable.')
         })

      return (): void => {
         abortController.abort()
      }
   }, [
      selectedCountry?.alpha2,
      selectedCountry?.alpha3,
      selectedCountry?.country,
      selectedCountry?.latitude,
      selectedCountry?.longitude,
      selectedCountry?.numeric,
   ])

   if (selectedCountry == null) {
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )
   }

   const country = selectedCountry

   const countryEmoji = resolveCountryEmojiByAlpha2(country.alpha2)

   const displayedCountryName = countryProfile?.summary.name ?? country.country
   const displayedFlagUrl = countryProfile?.summary.flagPngUrl
      ?? `https://flagcdn.com/w320/${country.alpha2.toLowerCase()}.png`

   const identityFields: FieldItem[] = [
      {
         label: 'Country',
         value: formatDisplayValues(displayedCountryName, countryEmoji),
         prominent: true,
      },
      {
         label: 'Native name',
         value: countryProfile?.summary.nativeName ?? N_A_VALUE,
      },
      {
         label: 'Capital',
         value: countryProfile?.geography.capital ?? N_A_VALUE,
      },
      {
         label: 'Region',
         value: countryProfile?.geography.region ?? N_A_VALUE,
      },
      {
         label: 'Subregion',
         value: countryProfile?.geography.subregion ?? N_A_VALUE,
      },
      {
         label: 'Alpha-2',
         value: countryProfile?.summary.alpha2 ?? country.alpha2,
      },
      {
         label: 'Alpha-3',
         value: countryProfile?.summary.alpha3 ?? country.alpha3,
      },
      {
         label: 'Numeric',
         value: countryProfile?.summary.numericCode ?? String(country.numeric),
      },
   ]

   const geographyFields: FieldItem[] = [
      {
         label: 'Latitude',
         value: formatCoordinate(countryProfile?.geography.latitude ?? country.latitude),
      },
      {
         label: 'Longitude',
         value: formatCoordinate(countryProfile?.geography.longitude ?? country.longitude),
      },
      {
         label: 'Area (km²)',
         value: formatNumber(countryProfile?.geography.areaKm2 ?? null),
      },
      {
         label: 'Borders',
         value: formatList(countryProfile?.geography.borders ?? []),
      },
      {
         label: 'Timezones',
         value: formatList(countryProfile?.geography.timezones ?? []),
      },
      {
         label: 'Top-level domains',
         value: formatList(countryProfile?.geography.topLevelDomains ?? []),
      },
   ]

   const demographicsFields: FieldItem[] = [
      {
         label: 'Population',
         value: formatNumber(countryProfile?.demographics.population ?? null),
      },
      {
         label: 'Demonym',
         value: countryProfile?.summary.demonym ?? N_A_VALUE,
      },
      {
         label: 'Gini',
         value: formatDecimal(countryProfile?.demographics.gini ?? null),
      },
      {
         label: 'Calling codes',
         value: formatList(countryProfile?.demographics.callingCodes ?? []),
      },
      {
         label: 'Alt spellings',
         value: formatList(countryProfile?.demographics.altSpellings ?? []),
      },
   ]

   const economyAndCultureFields: FieldItem[] = [
      {
         label: 'Currencies',
         value: formatCurrencies(countryProfile),
      },
      {
         label: 'Languages',
         value: formatLanguages(countryProfile),
      },
      {
         label: 'Regional blocs',
         value: formatRegionalBlocs(countryProfile),
      },
      {
         label: 'Translations',
         value: formatTranslations(countryProfile),
      },
      {
         label: 'Independent',
         value: countryProfile?.summary.independent == null
            ? N_A_VALUE
            : countryProfile.summary.independent
               ? 'Yes'
               : 'No',
      },
      {
         label: 'CIOC',
         value: countryProfile?.summary.cioc ?? N_A_VALUE,
      },
   ]

   const worldometerFields: FieldItem[] = useMemo((): FieldItem[] => {
      const worldometer = countryProfile?.worldometer

      if (worldometer == null) {
         return [
            {
               label: 'Worldometer data',
               value: N_A_VALUE,
            },
         ]
      }

      return [
         {
            label: 'Cases',
            value: formatNumber(worldometer.cases),
         },
         {
            label: 'Deaths',
            value: formatNumber(worldometer.deaths),
         },
         {
            label: 'Recovered',
            value: formatNumber(worldometer.recovered),
         },
         {
            label: 'Active',
            value: formatNumber(worldometer.active),
         },
         {
            label: 'Critical',
            value: formatNumber(worldometer.critical),
         },
         {
            label: 'Tests',
            value: formatNumber(worldometer.tests),
         },
         {
            label: 'Cases / 1M',
            value: formatNumber(worldometer.casesPerOneMillion),
         },
         {
            label: 'Deaths / 1M',
            value: formatNumber(worldometer.deathsPerOneMillion),
         },
      ]
   }, [countryProfile])

   const canFocusOnCountry =
      Number.isFinite(country.latitude) && Number.isFinite(country.longitude)

   const focusOnCountry = (): void => {
      if (!canFocusOnCountry) return
      
      flyToCoordinates(country.latitude, country.longitude, {
         zoomMultiplier: DETAILS_FOCUS_ZOOM_MULTIPLIER,
      })
   }

   return (
      <div className="w-full min-w-0 max-w-full max-h-[40rem] space-y-4 overflow-x-hidden overflow-y-auto pr-1">
         <section className="space-y-2">
            <div className="flex items-center gap-3">
               <img
                  src={displayedFlagUrl}
                  alt={`${displayedCountryName} flag`}
                  className="h-8 w-12 rounded border border-white/20 object-cover"
                  referrerPolicy="no-referrer"
               />
               <h1 className="text-xl font-bold text-white/80">{identityFields.at(0)?.value}</h1><br/>
            </div>

            {isProfileLoading && (
               <p className="text-xs text-white/70">Loading live country profile...</p>
            )}

            {profileError != null && (
               <p className="text-xs text-amber-300">{profileError}</p>
            )}
         </section>

         <DataSection title="Identity" fields={identityFields} />
         <DataSection title="Geography" fields={geographyFields} />
         <DataSection title="Demographics" fields={demographicsFields} />
         <DataSection title="Economy & Culture" fields={economyAndCultureFields} />
         <DataSection title="Worldometer - Disease (COVID-19)" fields={worldometerFields} />

         <section className="flex flex-wrap items-center gap-2 pt-2">
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
