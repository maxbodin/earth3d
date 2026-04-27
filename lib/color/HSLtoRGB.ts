/**
 * Inlined HSL-to-RGB color generation.
 */
export function HSLtoRGB(h: number, s: number, l: number): { r: number; g: number; b: number } {
   const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100)
   const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
   const m = l / 100 - c / 2

   let r1: number, g1: number, b1: number

   if (h < 60) { r1 = c; g1 = x; b1 = 0 }
   else if (h < 120) { r1 = x; g1 = c; b1 = 0 }
   else if (h < 180) { r1 = 0; g1 = c; b1 = x }
   else if (h < 240) { r1 = 0; g1 = x; b1 = c }
   else if (h < 300) { r1 = x; g1 = 0; b1 = c }
   else { r1 = c; g1 = 0; b1 = x }

   return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
   }
}