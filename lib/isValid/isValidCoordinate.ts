import { isValidLongitude } from '@/lib/isValid/isValidLongitude'
import { isValidLatitude } from '@/lib/isValid/isValidLatitude'
import { NullableCoordinates } from '@/app/types/coordinates/nullableCoordinates'
import { Coordinates } from '@/app/types/coordinates/coordinates'

export function isValidCoordinate(
   coords: NullableCoordinates,
): coords is Coordinates {
   return isValidLatitude(coords.latitude) && isValidLongitude(coords.longitude)
}