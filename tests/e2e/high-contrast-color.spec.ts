import { expect, test } from '@playwright/test'
import { getRandomHighContrastColor } from '@/lib/color/getRandomHighContrastColor'
import { relativeLuminance } from '@/lib/color/relativeLuminance'
import { parseHex } from '@/lib/parse/parseHex'

test.describe('High contrast color generation', () => {
   test('produces valid hex color format', () => {
      for (let i = 0; i < 50; i++) {
         const color = getRandomHighContrastColor()
         expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      }
   })

   test('produces colors distinguishable from both dark and light backgrounds', () => {
      for (let i = 0; i < 50; i++) {
         const color = getRandomHighContrastColor()
         const { r, g, b } = parseHex(color)
         const lum = relativeLuminance(r, g, b)

         // Contrast ratio against black (luminance 0): must be clearly visible.
         const contrastVsBlack = (lum + 0.05) / 0.05
         expect(contrastVsBlack).toBeGreaterThan(2)

         // Must not be too close to white (luminance 1).
         // Mid-lightness saturated colors have luminance well below 0.8.
         expect(lum).toBeLessThan(0.85)
      }
   })

   test('produces varied hues across multiple calls', () => {
      const hues = new Set<number>()

      for (let i = 0; i < 100; i++) {
         const color = getRandomHighContrastColor()
         const { r, g, b } = parseHex(color)

         // Approximate hue bucket (0-11 for 30-degree segments).
         const max = Math.max(r, g, b)
         const min = Math.min(r, g, b)
         if (max === min) continue

         let h: number
         if (max === r) h = ((g - b) / (max - min)) % 6
         else if (max === g) h = (b - r) / (max - min) + 2
         else h = (r - g) / (max - min) + 4

         hues.add(Math.floor(((h * 60 + 360) % 360) / 30))
      }

      // Expect at least 4 distinct hue buckets out of 12.
      expect(hues.size).toBeGreaterThanOrEqual(4)
   })
})
