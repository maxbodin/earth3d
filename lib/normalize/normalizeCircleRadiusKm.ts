import { clamp } from '@/lib/math/clamp'
import { MAX_CIRCLE_RADIUS_KM, MIN_CIRCLE_RADIUS_KM } from '@/app/constants/numbers'

/**
 * Clamps and rounds a circle radius to one decimal place within the allowed range.
 *
 * @param radiusKm - The raw radius value in kilometres.
 * @returns The normalized radius clamped to `[MIN_CIRCLE_RADIUS_KM, MAX_CIRCLE_RADIUS_KM]`.
 */
export function normalizeCircleRadiusKm(radiusKm: number): number {
   return Math.round(clamp(radiusKm, MIN_CIRCLE_RADIUS_KM, MAX_CIRCLE_RADIUS_KM) * 10) / 10
}