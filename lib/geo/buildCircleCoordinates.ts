import { destinationPoint } from '@/lib/geo/destinationPoint'
import { Coordinates } from '@/app/types/coordinates/coordinates'
import { FULL_CIRCLE_DEGREES } from '@/app/constants/numbers'

/**
 * Generates an array of coordinates forming a geodesic circle on the Earth surface.
 *
 * @param center - The center coordinate of the circle.
 * @param radiusKm - The radius in kilometres.
 * @param segments - The number of line segments (minimum 8). The last point equals the first to close the ring.
 * @returns An array of coordinates tracing the circle perimeter.
 */
export function buildCircleCoordinates(
   center: Coordinates,
   radiusKm: number,
   segments: number,
): Coordinates[] {
   const safeSegments = Math.max(8, Math.floor(segments))

   return Array.from({ length: safeSegments + 1 }, (_, index): Coordinates => {
      const bearing = (index / safeSegments) * FULL_CIRCLE_DEGREES
      return destinationPoint(center, bearing, radiusKm)
   })
}