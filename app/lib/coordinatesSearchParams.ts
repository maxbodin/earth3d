import { Coordinates } from '@/app/types/coordinates/coordinates'
import { serializeCoordinate } from '@/lib/serialize/serializeCoordinate'
import { normalizeCoordinates } from '@/lib/normalize/normalizeCoordinates'
import { getCurrentUrl } from '@/lib/searchParams/getCurrentUrl'
import { replaceCurrentUrl } from '@/lib/searchParams/replaceCurrentUrl'

export const LATITUDE_SEARCH_PARAM_KEY = 'lat'
export const LONGITUDE_SEARCH_PARAM_KEY = 'lon'
export const LEGACY_LATITUDE_SEARCH_PARAM_KEY = 'latitude'
export const LEGACY_LONGITUDE_SEARCH_PARAM_KEY = 'longitude'
export const COORDINATES_SEARCH_PARAMS_UPDATED_EVENT =
   'coordinates-search-params-updated'

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
   const currentUrl = getCurrentUrl()
   if (currentUrl == null) return null

   return readCoordinatesFromSearchParams(currentUrl.searchParams)
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
   const currentUrl = getCurrentUrl()
   if (currentUrl == null) return

   const normalizedCoordinates = normalizeCoordinates(latitude, longitude)
   if (normalizedCoordinates == null) return

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

   replaceCurrentUrl(currentUrl, COORDINATES_SEARCH_PARAMS_UPDATED_EVENT, normalizedCoordinates)
}

export function clearCoordinatesFromCurrentUrl(): void {
   const currentUrl = getCurrentUrl()
   if (currentUrl == null) return

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

   replaceCurrentUrl(currentUrl, COORDINATES_SEARCH_PARAMS_UPDATED_EVENT, null)
}
