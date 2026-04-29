import { Coordinates } from '@/app/types/coordinates/coordinates'

export function getAntipodeCoordinates(
   latitude: number,
   longitude: number,
): Coordinates {
   const oppositeLatitude = -latitude
   let oppositeLongitude = longitude + 180

   if (oppositeLongitude > 180) {
      oppositeLongitude -= 360
   }

   return {
      latitude: oppositeLatitude,
      longitude: oppositeLongitude,
   }
}