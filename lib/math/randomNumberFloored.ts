/**
 * Helper function to generate a random number between min and max.
 * @param min
 * @param max
 */
export function randomNumberFloored(min: number, max: number): number {
   return Math.floor(Math.random() * (max - min + 1)) + min
}