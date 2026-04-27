import { Coordinates } from '@/app/types/coordinates'
import { toRad } from '@/lib/to/toRad'
import { toDeg } from '@/lib/to/toDeg'

export function midpoint(a: Coordinates, b: Coordinates): Coordinates {
   const lat1 = toRad(a.latitude)
   const lon1 = toRad(a.longitude)
   const lat2 = toRad(b.latitude)
   const lon2 = toRad(b.longitude)

   const dLon = lon2 - lon1

   const bx = Math.cos(lat2) * Math.cos(dLon)
   const by = Math.cos(lat2) * Math.sin(dLon)

   const midLat = Math.atan2(
      Math.sin(lat1) + Math.sin(lat2),
      Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by),
   )
   const midLon = lon1 + Math.atan2(by, Math.cos(lat1) + bx)

   return {
      latitude: toDeg(midLat),
      longitude: toDeg(midLon),
   }
}