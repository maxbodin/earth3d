import { FULL_CIRCLE_DEGREES, HEATMAP_DOT_RADIUS, MAX_LATITUDE, MAX_LONGITUDE } from '@/app/constants/numbers'
import { drawHeatmapGradient } from '@/lib/three/heatmap/drawHeatmapGradient'

/**
 *
 * @param ctx
 * @param lat
 * @param lon
 * @param intensity
 * @param canvasWidth
 * @param canvasHeight
 */
export function drawHeatmapPointFromCoords(
   ctx: CanvasRenderingContext2D,
   lat: number,
   lon: number,
   intensity: number,
   canvasWidth: number,
   canvasHeight: number,
): void {
   const u = (lon + MAX_LONGITUDE) / FULL_CIRCLE_DEGREES
   const v = (MAX_LATITUDE - lat) / MAX_LONGITUDE

   const size = HEATMAP_DOT_RADIUS + intensity * 4
   const normalizedIntensity = Math.min(intensity, 1)
   const hue = (1 - normalizedIntensity) * 120
   const alpha = Math.min(normalizedIntensity * 0.6, 0.5)
   const color = `hsla(${hue}, 100%, 50%, ${alpha})`
   const transparentColor = `hsla(${hue}, 100%, 50%, 0)`

   const cx = u * canvasWidth
   const cy = v * canvasHeight

   drawHeatmapGradient(ctx, cx, cy, size, color, transparentColor)

   const edgeThreshold = size / canvasWidth
   if (u < edgeThreshold) {
      drawHeatmapGradient(ctx, cx + canvasWidth, cy, size, color, transparentColor)
   } else if (u > 1 - edgeThreshold) {
      drawHeatmapGradient(ctx, cx - canvasWidth, cy, size, color, transparentColor)
   }
}