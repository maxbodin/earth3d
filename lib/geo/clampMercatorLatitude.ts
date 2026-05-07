import * as THREE from 'three'
import { WEB_MERCATOR_MAX_LATITUDE } from '@/app/components/atoms/three/circleMarkers.controller'

/**
 * Clamps a latitude value to the Web Mercator projection limit (~85.05°).
 * @param latitude
 */
export function clampMercatorLatitude(latitude: number): number {
   return THREE.MathUtils.clamp(latitude, -WEB_MERCATOR_MAX_LATITUDE, WEB_MERCATOR_MAX_LATITUDE)
}