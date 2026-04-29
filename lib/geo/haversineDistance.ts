import { Coordinates } from '@/app/types/coordinates/coordinates'
import { EARTH_RADIUS_KM } from '@/app/constants/numbers'
import { toRad } from '@/lib/to/toRad'

export function haversineDistance(a: Coordinates, b: Coordinates): number {
   const dLat = toRad(b.latitude - a.latitude)
   const dLon = toRad(b.longitude - a.longitude)

   const sinHalfDLat = Math.sin(dLat / 2)
   const sinHalfDLon = Math.sin(dLon / 2)

   const h =
      sinHalfDLat * sinHalfDLat +
      Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinHalfDLon * sinHalfDLon

   return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}
