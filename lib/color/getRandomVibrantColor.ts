import { RGBtoHex } from '@/lib/color/RGBtoHex'
import { randomNumberFloored } from '@/lib/math/randomNumberFloored'

/**
 * Generates a random vibrant hex color.
 * @returns {string} The hex color string.
 */
export function getRandomVibrantColor(): string {
   let r: number = randomNumberFloored(190, 230)
   let g: number = randomNumberFloored(190, 230)
   let b: number = randomNumberFloored(190, 230)

   const randFactor: number = Math.random() * 4
   if (randFactor <= 1) {
      r = r - (Math.random() * 50)
   } else if (randFactor <= 2) {
      g = g - (Math.random() * 50)
   } else if (randFactor <= 3) {
      b = b - (Math.random() * 50)
   }

   return RGBtoHex(r, g, b)
}