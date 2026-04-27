import { HSLtoRGB } from '@/lib/color/HSLtoRGB'
import { RGBtoHex } from '@/lib/color/RGBtoHex'
import { randomNumberFloored } from '@/lib/math/randomNumberFloored'

/**
 * Generates a random high-contrast hex color using HSL with high saturation
 * and medium lightness, suitable for 3D overlays on varied backgrounds.
 */
export function getRandomHighContrastColor(): string {
   const h = Math.random() * 360
   const s = randomNumberFloored(80, 100)
   const l = randomNumberFloored(50, 55)
   const { r, g, b } = HSLtoRGB(h, s, l)
   return RGBtoHex(r, g, b)
}