import { Coordinates } from '@/app/types/coordinates/coordinates'
import { EARTH_RADIUS_KM, MAX_LATITUDE, MIN_LATITUDE } from '@/app/constants/numbers'
import { toRad } from '@/lib/to/toRad'
import { toDeg } from '@/lib/to/toDeg'
import { normalizeLongitude } from '@/lib/normalize/normalizeLongitude'

/**
 * Computes the destination coordinate given an origin, bearing, and distance
 * using the spherical law of cosines (haversine-based forward geodesic).
 *
 * @param origin - The starting coordinate.
 * @param bearingDegrees - The initial bearing in degrees (0 = north, 90 = east).
 * @param distanceKm - The surface distance in kilometres.
 * @returns The destination coordinate clamped to valid lat/long bounds.
 */
export function destinationPoint(
   origin: Coordinates,
   bearingDegrees: number,
   distanceKm: number,
): Coordinates {
   const angularDistance = distanceKm / EARTH_RADIUS_KM
   const bearing = toRad(bearingDegrees)
   const lat1 = toRad(origin.latitude)
   const lon1 = toRad(origin.longitude)

   const sinLat1 = Math.sin(lat1)
   const cosLat1 = Math.cos(lat1)
   const sinAngularDistance = Math.sin(angularDistance)
   const cosAngularDistance = Math.cos(angularDistance)

   const lat2 = Math.asin(
      sinLat1 * cosAngularDistance + cosLat1 * sinAngularDistance * Math.cos(bearing),
   )
   const lon2 = lon1 + Math.atan2(
      Math.sin(bearing) * sinAngularDistance * cosLat1,
      cosAngularDistance - sinLat1 * Math.sin(lat2),
   )

   return {
      latitude: Math.min(Math.max(toDeg(lat2), MIN_LATITUDE), MAX_LATITUDE),
      longitude: normalizeLongitude(toDeg(lon2)),
   }
}