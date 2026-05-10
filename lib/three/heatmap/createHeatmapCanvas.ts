import { HEATMAP_CANVAS_HEIGHT, HEATMAP_CANVAS_WIDTH } from '@/app/constants/numbers'

/**
 *
 */
export function createHeatmapCanvas(): HTMLCanvasElement {
   const canvas = document.createElement('canvas')
   canvas.width = HEATMAP_CANVAS_WIDTH
   canvas.height = HEATMAP_CANVAS_HEIGHT
   return canvas
}