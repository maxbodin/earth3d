import { isValidCoordinate } from '@/lib/isValid/isValidCoordinate'
import { Feature } from '@/app/types/orsTypes'
import { ParsedPlaceCoordinates } from '@/app/types/parsedPlaceCoordinates'
import { formatCoordinate } from '@/lib/format/formatCoordinate'

export function parsePlaceCoordinates(feature: Feature): ParsedPlaceCoordinates {
   const latitudeRaw = Number(feature.geometry.coordinates?.[1])
   const longitudeRaw = Number(feature.geometry.coordinates?.[0])
   const hasValidCoordinates = isValidCoordinate({ latitude: latitudeRaw, longitude: longitudeRaw })

   const latitude = hasValidCoordinates ? latitudeRaw : NaN
   const longitude = hasValidCoordinates ? longitudeRaw : NaN

   return {
      hasValidCoordinates,
      latitude,
      longitude,
      strLatitude: formatCoordinate(latitude),
      strLongitude: formatCoordinate(longitude),
   }
}