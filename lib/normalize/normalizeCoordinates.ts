import { Coordinates } from '@/app/types/coordinates/coordinates'
import { parseNumber } from '@/lib/parse/parseNumber'
import { isValidLatitude } from '@/lib/isValid/isValidLatitude'
import { isValidLongitude } from '@/lib/isValid/isValidLongitude'

export function normalizeCoordinates(
   latitudeValue: unknown,
   longitudeValue: unknown,
): Coordinates | null {
   const latitude = parseNumber(latitudeValue)
   const longitude = parseNumber(longitudeValue)

   if (latitude == null || longitude == null) return null
   if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) return null

   return {
      latitude,
      longitude,
   }
}