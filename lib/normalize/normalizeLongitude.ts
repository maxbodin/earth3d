import { FULL_CIRCLE_DEGREES, MAX_LONGITUDE, MIN_LONGITUDE } from '@/app/constants/numbers'

/**
 * Wraps a longitude value into the [-180, 180] range.
 * @param longitude
 */
export function normalizeLongitude(longitude: number): number {
   return ((((longitude + MAX_LONGITUDE) % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES) + MIN_LONGITUDE
}