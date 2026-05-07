import { CircleMarker } from '@/app/types/circleMarker'
import { getRandomVibrantColor } from '@/lib/color/getRandomVibrantColor'
import { DEFAULT_CIRCLE_RADIUS_KM } from '@/app/constants/numbers'

/**
 * Generates a unique identifier for a new circle marker.
 * @returns 
 */
export function generateCircleMarkerId(): string {
   return `circle_marker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

interface CreateCircleMarkerParams {
   name?: string
   latitude?: number
   longitude?: number
   radiusKm?: number
   color?: string
}

/**
 * Creates a new `CircleMarker`.
 *
 * @param params - Optional overrides for name, position, radius, and color.
 * @returns A fully initialised circle marker with a unique id.
 */
export function createCircleMarker({
   name = '',
   latitude = 0,
   longitude = 0,
   radiusKm = DEFAULT_CIRCLE_RADIUS_KM,
   color,
}: CreateCircleMarkerParams = {}): CircleMarker {
   return {
      id: generateCircleMarkerId(),
      name,
      latitude,
      longitude,
      radiusKm,
      color: color ?? getRandomVibrantColor(),
      address: '',
      isPuck: false,
      showTitleOnMap: true,
   }
}