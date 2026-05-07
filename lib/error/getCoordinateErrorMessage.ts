import { isValidLatitude } from '@/lib/isValid/isValidLatitude'
import { isValidLongitude } from '@/lib/isValid/isValidLongitude'
import { CoordinateField } from '@/lib/types/coordinatesField'

/**
 * Returns a validation error message for an out-of-range coordinate, or `null` if valid.
 * @param field
 * @param value
 */
export const getCoordinateErrorMessage = (
   field: CoordinateField,
   value: number | null,
): string | null => {
   if (value == null) {
      return field === 'latitude'
         ? 'Latitude must be a valid number.'
         : 'Longitude must be a valid number.'
   }

   if (field === 'latitude' && isValidLatitude(value)) {
      return 'Latitude must be between -90 and 90.'
   }

   if (field === 'longitude' && isValidLongitude(value)) {
      return 'Longitude must be between -180 and 180.'
   }

   return null
}