import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Used to merge Tailwind CSS Class names.
 * @param inputs
 */
export function cn(...inputs: ClassValue[]): string {
   return twMerge(clsx(inputs))
}

/**
 * Helper function to generate a random value between min and max.
 * @param min
 * @param max
 */
const randomValueFLoored = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

/**
 * Helper function to convert RGB values to hex.
 * @param r
 * @param g
 * @param b
 */
const RGBtoHex = (r: number, g: number, b: number) => '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)

/**
 * Generates a random vibrant hex color.
 * @returns {string} The hex color string.
 */
export function getRandomVibrantColor(): string {
   let r: number = randomValueFLoored(190, 230)
   let g: number = randomValueFLoored(190, 230)
   let b: number = randomValueFLoored(190, 230)

   const randFactor: number = Math.random() * 4
   if (randFactor <= 1) {
      r = r - (Math.random() * 50)
   } else if (randFactor <= 2) {
      g = g - (Math.random() * 50)
   } else if (randFactor <= 3) {
      b = b - (Math.random() * 50)
   }

   // Construct and return the hex color string.
   return RGBtoHex(r, g, b)
}