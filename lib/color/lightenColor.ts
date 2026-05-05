import { Color } from 'three'

/**
 * Lightens a hex color by linearly interpolating toward white.
 *
 * @param hex - The hex color string (e.g. `"#ff0000"`).
 * @param factor - The interpolation factor between 0 (no change) and 1 (pure white).
 * @returns The lightened color as a hex string with `#` prefix.
 */
export function lightenColor(hex: string, factor: number): string {
   const color = new Color(hex)
   color.lerp(new Color(0xffffff), factor)
   return `#${color.getHexString()}`
}
