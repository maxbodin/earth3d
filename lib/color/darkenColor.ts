import { Color } from 'three'

/**
 * Darkens a hex color by multiplying its RGB channels by a scalar.
 *
 * @param hex - The hex color string (e.g. `"#ff0000"`).
 * @param factor - The scalar multiplier (e.g. `0.5` halves brightness).
 * @returns The darkened color as a hex string with `#` prefix.
 */
export function darkenColor(hex: string, factor: number): string {
   const color = new Color(hex)
   color.multiplyScalar(factor)
   return `#${color.getHexString()}`
}
