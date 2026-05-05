import { getCurrentUrl } from '@/lib/searchParams/getCurrentUrl'
import { replaceCurrentUrl } from '@/lib/searchParams/replaceCurrentUrl'

export const COUNTRY_SEARCH_PARAM_KEY = 'country'
const COUNTRY_SEARCH_PARAMS_UPDATED_EVENT = 'country-search-params-updated'

function normalizeCountrySearchParam(value: unknown): string | null {
   if (typeof value !== 'string') return null

   const trimmedValue = value.trim()
   return trimmedValue.length > 0 ? trimmedValue : null
}

export function readCountryFromSearchParams(
   searchParams: URLSearchParams,
): string | null {
   return normalizeCountrySearchParam(
      searchParams.get(COUNTRY_SEARCH_PARAM_KEY),
   )
}

export function readCountryFromCurrentUrl(): string | null {
   const currentUrl = getCurrentUrl()
   if (currentUrl == null) return null

   return readCountryFromSearchParams(currentUrl.searchParams)
}

export function updateCountryInCurrentUrl(country: string): void {
   const currentUrl = getCurrentUrl()
   if (currentUrl == null) return

   const normalizedCountry = normalizeCountrySearchParam(country)
   if (normalizedCountry == null) return

   const currentCountry = readCountryFromSearchParams(currentUrl.searchParams)
   if (currentCountry === normalizedCountry) return

   currentUrl.searchParams.set(COUNTRY_SEARCH_PARAM_KEY, normalizedCountry)

   replaceCurrentUrl(currentUrl, COUNTRY_SEARCH_PARAMS_UPDATED_EVENT, {
      country: normalizedCountry,
   })
}

export function clearCountryFromCurrentUrl(): void {
   const currentUrl = getCurrentUrl()
   if (currentUrl == null) return

   if (!currentUrl.searchParams.has(COUNTRY_SEARCH_PARAM_KEY)) return

   currentUrl.searchParams.delete(COUNTRY_SEARCH_PARAM_KEY)

   replaceCurrentUrl(currentUrl, COUNTRY_SEARCH_PARAMS_UPDATED_EVENT, {
      country: null,
   })
}
