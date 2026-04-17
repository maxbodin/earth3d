import countriesCoords from '@/app/data/country-codes-lat-long-alpha3.json'
import { Country } from '@/app/types/countryType'

type CountriesCoordinatesDataset = {
   ref_country_codes: Country[]
}

const countriesDataset = countriesCoords as CountriesCoordinatesDataset
const allCountries = countriesDataset.ref_country_codes

export function normalizeCountryName(countryName: string): string {
   return countryName.trim().toLowerCase()
}

export function findCountryByName(countryName: string): Country | undefined {
   const normalizedCountryName = normalizeCountryName(countryName)

   if (normalizedCountryName.length === 0) {
      return undefined
   }

   return allCountries.find((country: Country): boolean => {
      return normalizeCountryName(country.country) === normalizedCountryName
   })
}

export function filterCountriesByPrefix(countryNamePrefix: string): Country[] {
   const normalizedPrefix = normalizeCountryName(countryNamePrefix)

   if (normalizedPrefix.length === 0) {
      return []
   }

   return allCountries.filter((country: Country): boolean => {
      return normalizeCountryName(country.country).startsWith(normalizedPrefix)
   })
}
