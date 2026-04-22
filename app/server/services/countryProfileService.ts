'use server'

import {
   ApiCountriesCountryResponse,
   CountryCurrency,
   CountryLanguage,
   CountryProfile,
   CountryProfileSeed,
   CountryRegionalBloc,
   CountryWorldometerSnapshot,
   WorldometerCountryResponse,
} from '@/app/types/countryProfile'
import { toNullableString } from '@/lib/to/toNullableString'
import { fetchJsonIfOk } from '@/lib/fetchJsonIfOk'
import { toNullableNumber } from '@/lib/to/toNullableNumber'
import { toStringArray } from '@/lib/to/toStringArray'
import { toRecordOfStrings } from '@/lib/to/toRecordOfStrings'

const API_COUNTRIES_BASE_URL = 'https://www.apicountries.com/alpha'
const WORLDOMETER_BASE_URL = 'https://disease.sh/v3/covid-19/countries'

function normalizeCurrencyList(value: unknown): CountryCurrency[] {
   if (!Array.isArray(value)) {
      return []
   }

   return value
      .filter((currency: unknown): boolean => currency != null && typeof currency === 'object')
      .map((currency: unknown): CountryCurrency => {
         const typedCurrency = currency as Record<string, unknown>

         return {
            code: toNullableString(typedCurrency.code),
            name: toNullableString(typedCurrency.name),
            symbol: toNullableString(typedCurrency.symbol),
         }
      })
}

function normalizeLanguageList(value: unknown): CountryLanguage[] {
   if (!Array.isArray(value)) {
      return []
   }

   return value
      .filter((language: unknown): boolean => language != null && typeof language === 'object')
      .map((language: unknown): CountryLanguage => {
         const typedLanguage = language as Record<string, unknown>

         return {
            iso639_1: toNullableString(typedLanguage.iso639_1),
            iso639_2: toNullableString(typedLanguage.iso639_2),
            name: toNullableString(typedLanguage.name),
            nativeName: toNullableString(typedLanguage.nativeName),
         }
      })
}

function normalizeRegionalBlocList(value: unknown): CountryRegionalBloc[] {
   if (!Array.isArray(value)) {
      return []
   }

   return value
      .filter((bloc: unknown): boolean => bloc != null && typeof bloc === 'object')
      .map((bloc: unknown): CountryRegionalBloc => {
         const typedBloc = bloc as Record<string, unknown>

         return {
            acronym: toNullableString(typedBloc.acronym),
            name: toNullableString(typedBloc.name),
         }
      })
}

function normalizeFlags(value: unknown): { png: string | null; svg: string | null } {
   if (value == null || typeof value !== 'object' || Array.isArray(value)) {
      return {
         png: null,
         svg: null,
      }
   }

   const typedFlags = value as Record<string, unknown>

   return {
      png: toNullableString(typedFlags.png),
      svg: toNullableString(typedFlags.svg),
   }
}

async function fetchApiCountries(alpha2: string): Promise<ApiCountriesCountryResponse | null> {
   const normalizedAlpha2 = alpha2.trim().toUpperCase()
   if (normalizedAlpha2.length === 0) {
      return null
   }

   return fetchJsonIfOk<ApiCountriesCountryResponse>(
      `${API_COUNTRIES_BASE_URL}/${encodeURIComponent(normalizedAlpha2)}`,
   )
}

async function fetchWorldometerByCandidate(candidate: string): Promise<WorldometerCountryResponse | null> {
   const normalizedCandidate = candidate.trim()
   if (normalizedCandidate.length === 0) {
      return null
   }

   const queryParams = new URLSearchParams({
      strict: 'true',
      allowNull: 'true',
   })

   return fetchJsonIfOk<WorldometerCountryResponse>(
      `${WORLDOMETER_BASE_URL}/${encodeURIComponent(normalizedCandidate)}?${queryParams.toString()}`,
   )
}

async function fetchWorldometerSnapshot(seed: CountryProfileSeed): Promise<WorldometerCountryResponse | null> {
   const candidates = [
      seed.alpha2,
      seed.alpha3,
      seed.countryName,
   ].filter((candidate: string): boolean => candidate.trim().length > 0)

   for (const candidate of candidates) {
      const snapshot = await fetchWorldometerByCandidate(candidate)
      if (snapshot != null) {
         return snapshot
      }
   }

   return null
}

function normalizeWorldometerSnapshot(
   worldometerData: WorldometerCountryResponse | null,
): CountryWorldometerSnapshot | null {
   if (worldometerData == null) {
      return null
   }

   return {
      source: 'worldometers-via-disease-sh',
      updatedAt: toNullableNumber(worldometerData.updated),
      continent: toNullableString(worldometerData.continent),
      population: toNullableNumber(worldometerData.population),
      cases: toNullableNumber(worldometerData.cases),
      todayCases: toNullableNumber(worldometerData.todayCases),
      deaths: toNullableNumber(worldometerData.deaths),
      todayDeaths: toNullableNumber(worldometerData.todayDeaths),
      recovered: toNullableNumber(worldometerData.recovered),
      todayRecovered: toNullableNumber(worldometerData.todayRecovered),
      active: toNullableNumber(worldometerData.active),
      critical: toNullableNumber(worldometerData.critical),
      tests: toNullableNumber(worldometerData.tests),
      casesPerOneMillion: toNullableNumber(worldometerData.casesPerOneMillion),
      deathsPerOneMillion: toNullableNumber(worldometerData.deathsPerOneMillion),
      testsPerOneMillion: toNullableNumber(worldometerData.testsPerOneMillion),
   }
}

export async function getCountryProfile(seed: CountryProfileSeed): Promise<CountryProfile> {
   const [apiCountriesResponse, worldometerResponse] = await Promise.all([
      fetchApiCountries(seed.alpha2),
      fetchWorldometerSnapshot(seed),
   ])

   const flags = normalizeFlags(apiCountriesResponse?.flags)
   const apiLatLng = Array.isArray(apiCountriesResponse?.latlng)
      ? apiCountriesResponse?.latlng
      : []

   const apiLatitude = toNullableNumber(apiLatLng[0])
   const apiLongitude = toNullableNumber(apiLatLng[1])

   const worldometer = normalizeWorldometerSnapshot(worldometerResponse)

   const normalizedProfile: CountryProfile = {
      summary: {
         name: toNullableString(apiCountriesResponse?.name) ?? seed.countryName,
         nativeName: toNullableString(apiCountriesResponse?.nativeName),
         alpha2: (
            toNullableString(apiCountriesResponse?.alpha2Code)
            ?? seed.alpha2
         ).toUpperCase(),
         alpha3: (
            toNullableString(apiCountriesResponse?.alpha3Code)
            ?? seed.alpha3
         ).toUpperCase(),
         numericCode: toNullableString(apiCountriesResponse?.numericCode)
            ?? (seed.numericCode != null ? String(seed.numericCode) : null),
         demonym: toNullableString(apiCountriesResponse?.demonym),
         independent: typeof apiCountriesResponse?.independent === 'boolean'
            ? apiCountriesResponse.independent
            : null,
         cioc: toNullableString(apiCountriesResponse?.cioc),
         flagPngUrl: flags.png,
         flagSvgUrl: flags.svg,
      },
      geography: {
         capital: toNullableString(apiCountriesResponse?.capital),
         region: toNullableString(apiCountriesResponse?.region),
         subregion: toNullableString(apiCountriesResponse?.subregion),
         latitude: apiLatitude ?? seed.latitude,
         longitude: apiLongitude ?? seed.longitude,
         areaKm2: toNullableNumber(apiCountriesResponse?.area),
         timezones: toStringArray(apiCountriesResponse?.timezones),
         borders: toStringArray(apiCountriesResponse?.borders),
         topLevelDomains: toStringArray(apiCountriesResponse?.topLevelDomain),
      },
      demographics: {
         population: toNullableNumber(apiCountriesResponse?.population),
         gini: toNullableNumber(apiCountriesResponse?.gini),
         callingCodes: toStringArray(apiCountriesResponse?.callingCodes),
         altSpellings: toStringArray(apiCountriesResponse?.altSpellings),
      },
      economy: {
         currencies: normalizeCurrencyList(apiCountriesResponse?.currencies),
      },
      culture: {
         languages: normalizeLanguageList(apiCountriesResponse?.languages),
         translations: toRecordOfStrings(apiCountriesResponse?.translations),
         regionalBlocs: normalizeRegionalBlocList(apiCountriesResponse?.regionalBlocs),
      },
      worldometer,
      meta: {
         hasApiCountries: apiCountriesResponse != null,
         hasWorldometer: worldometer != null,
         fetchedAtIso: new Date().toISOString(),
      },
   }

   return normalizedProfile
}
