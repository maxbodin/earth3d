import { Marker } from '@/app/types/marker'

/**
 * Marker that defines a geodesic circle on the earth surface, extending the base marker with a radius.
 */
export interface CircleMarker extends Marker {
   radiusKm: number
}