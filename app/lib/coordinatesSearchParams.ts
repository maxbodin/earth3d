import { Coordinates } from '@/app/types/coordinates'

export const LATITUDE_SEARCH_PARAM_KEY = 'lat'
export const LONGITUDE_SEARCH_PARAM_KEY = 'lon'
export const LEGACY_LATITUDE_SEARCH_PARAM_KEY = 'latitude'
export const LEGACY_LONGITUDE_SEARCH_PARAM_KEY = 'longitude'
export const COUNTRY_SEARCH_PARAM_KEY = 'country'
export const COORDINATES_SEARCH_PARAMS_UPDATED_EVENT =
   'coordinates-search-params-updated'

const SEARCH_PARAM_PRECISION = 6
const MIN_LATITUDE = -90
const MAX_LATITUDE = 90
const MIN_LONGITUDE = -180
const MAX_LONGITUDE = 180

function toFiniteNumber(value: unknown): number | null {
   if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null
   }

   if (typeof value !== 'string') return null

   const trimmedValue = value.trim()
   if (trimmedValue.length === 0) return null

   const parsedValue = Number(trimmedValue)
   return Number.isFinite(parsedValue) ? parsedValue : null
}

function isLatitudeInRange(latitude: number): boolean {
   return latitude >= MIN_LATITUDE && latitude <= MAX_LATITUDE
}

function isLongitudeInRange(longitude: number): boolean {
   return longitude >= MIN_LONGITUDE && longitude <= MAX_LONGITUDE
}

function serializeCoordinate(value: number): string {
   return value.toFixed(SEARCH_PARAM_PRECISION)
}

function normalizeCountrySearchParam(value: unknown): string | null {
   if (typeof value !== 'string') return null

   const trimmedValue = value.trim()
   return trimmedValue.length > 0 ? trimmedValue : null
}

function replaceCurrentUrlAndDispatchUpdate(
   currentUrl: URL,
   detail: unknown,
): void {
   const queryString = currentUrl.searchParams.toString()
   const nextRelativeUrl = `${currentUrl.pathname}${
      queryString.length > 0 ? `?${queryString}` : ''
   }${currentUrl.hash}`

   window.history.replaceState(window.history.state, '', nextRelativeUrl)

   window.dispatchEvent(
      new CustomEvent(COORDINATES_SEARCH_PARAMS_UPDATED_EVENT, {
         detail,
      }),
   )
}

export function normalizeCoordinates(
   latitudeValue: unknown,
   longitudeValue: unknown,
): Coordinates | null {
   const latitude = toFiniteNumber(latitudeValue)
   const longitude = toFiniteNumber(longitudeValue)

   if (latitude == null || longitude == null) return null
   if (!isLatitudeInRange(latitude) || !isLongitudeInRange(longitude)) return null

   return {
      latitude,
      longitude,
   }
}

export function parseCoordinatesFromUnknown(rawCoordinates: unknown): Coordinates | null {
   if (rawCoordinates == null) return null

   if (!Array.isArray(rawCoordinates) && typeof rawCoordinates === 'object') {
      const candidate = rawCoordinates as Partial<Coordinates>
      return normalizeCoordinates(candidate.latitude, candidate.longitude)
   }

   if (!Array.isArray(rawCoordinates)) return null

   if (rawCoordinates.length >= 2) {
      const directCoordinates = normalizeCoordinates(
         rawCoordinates[1],
         rawCoordinates[0],
      )
      if (directCoordinates != null) {
         return directCoordinates
      }
   }

   const latestCoordinates = rawCoordinates.at(-1)
   if (!Array.isArray(latestCoordinates) || latestCoordinates.length < 2) {
      return null
   }

   return normalizeCoordinates(latestCoordinates[1], latestCoordinates[0])
}

export function readCoordinatesFromSearchParams(
   searchParams: URLSearchParams,
): Coordinates | null {
   const latitude =
      searchParams.get(LATITUDE_SEARCH_PARAM_KEY) ??
      searchParams.get(LEGACY_LATITUDE_SEARCH_PARAM_KEY)
   const longitude =
      searchParams.get(LONGITUDE_SEARCH_PARAM_KEY) ??
      searchParams.get(LEGACY_LONGITUDE_SEARCH_PARAM_KEY)

   return normalizeCoordinates(latitude, longitude)
}

export function readCoordinatesFromCurrentUrl(): Coordinates | null {
   if (typeof window === 'undefined') return null

   const currentUrl = new URL(window.location.href)
   return readCoordinatesFromSearchParams(currentUrl.searchParams)
}

export function readCountryFromSearchParams(
   searchParams: URLSearchParams,
): string | null {
   return normalizeCountrySearchParam(
      searchParams.get(COUNTRY_SEARCH_PARAM_KEY),
   )
}

export function readCountryFromCurrentUrl(): string | null {
   if (typeof window === 'undefined') return null

   const currentUrl = new URL(window.location.href)
   return readCountryFromSearchParams(currentUrl.searchParams)
}

export function coordinatesToKey(coordinates: Coordinates): string {
   return `${serializeCoordinate(coordinates.latitude)},${serializeCoordinate(
      coordinates.longitude,
   )}`
}

export function updateCoordinatesInCurrentUrl(
   latitude: number,
   longitude: number,
): void {
   if (typeof window === 'undefined') return

   const normalizedCoordinates = normalizeCoordinates(latitude, longitude)
   if (normalizedCoordinates == null) return

   const currentUrl = new URL(window.location.href)
   const currentCoordinates = readCoordinatesFromSearchParams(
      currentUrl.searchParams,
   )

   if (
      currentCoordinates != null &&
      coordinatesToKey(currentCoordinates) === coordinatesToKey(normalizedCoordinates)
   ) {
      return
   }

   currentUrl.searchParams.set(
      LATITUDE_SEARCH_PARAM_KEY,
      serializeCoordinate(normalizedCoordinates.latitude),
   )
   currentUrl.searchParams.set(
      LONGITUDE_SEARCH_PARAM_KEY,
      serializeCoordinate(normalizedCoordinates.longitude),
   )

   currentUrl.searchParams.delete(LEGACY_LATITUDE_SEARCH_PARAM_KEY)
   currentUrl.searchParams.delete(LEGACY_LONGITUDE_SEARCH_PARAM_KEY)

   replaceCurrentUrlAndDispatchUpdate(currentUrl, normalizedCoordinates)
}

export function clearCoordinatesFromCurrentUrl(): void {
   if (typeof window === 'undefined') return

   const currentUrl = new URL(window.location.href)
   const hasCoordinatesSearchParams =
      currentUrl.searchParams.has(LATITUDE_SEARCH_PARAM_KEY) ||
      currentUrl.searchParams.has(LONGITUDE_SEARCH_PARAM_KEY) ||
      currentUrl.searchParams.has(LEGACY_LATITUDE_SEARCH_PARAM_KEY) ||
      currentUrl.searchParams.has(LEGACY_LONGITUDE_SEARCH_PARAM_KEY)

   if (!hasCoordinatesSearchParams) return

   currentUrl.searchParams.delete(LATITUDE_SEARCH_PARAM_KEY)
   currentUrl.searchParams.delete(LONGITUDE_SEARCH_PARAM_KEY)
   currentUrl.searchParams.delete(LEGACY_LATITUDE_SEARCH_PARAM_KEY)
   currentUrl.searchParams.delete(LEGACY_LONGITUDE_SEARCH_PARAM_KEY)

   replaceCurrentUrlAndDispatchUpdate(currentUrl, null)
}

export function updateCountryInCurrentUrl(country: string): void {
   if (typeof window === 'undefined') return

   const normalizedCountry = normalizeCountrySearchParam(country)
   if (normalizedCountry == null) return

   const currentUrl = new URL(window.location.href)
   const currentCountry = readCountryFromSearchParams(currentUrl.searchParams)

   if (currentCountry === normalizedCountry) {
      return
   }

   currentUrl.searchParams.set(COUNTRY_SEARCH_PARAM_KEY, normalizedCountry)

   replaceCurrentUrlAndDispatchUpdate(currentUrl, {
      country: normalizedCountry,
   })
}

export function clearCountryFromCurrentUrl(): void {
   if (typeof window === 'undefined') return

   const currentUrl = new URL(window.location.href)
   const hasCountrySearchParam =
      currentUrl.searchParams.has(COUNTRY_SEARCH_PARAM_KEY)

   if (!hasCountrySearchParam) return

   currentUrl.searchParams.delete(COUNTRY_SEARCH_PARAM_KEY)

   replaceCurrentUrlAndDispatchUpdate(currentUrl, {
      country: null,
   })
}
