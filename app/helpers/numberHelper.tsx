/**
 * Clamp a value between min and max.
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min: number, max: number): number {
   return Math.min(Math.max(value, min), max)
}
