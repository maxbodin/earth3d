/** Relative luminance per WCAG 2.0. */
export function relativeLuminance(r: number, g: number, b: number): number {
   const toLinear = (c: number): number => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
   }
   return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}