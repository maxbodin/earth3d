/**
 *
 * @param ctx
 * @param cx
 * @param cy
 * @param size
 * @param color
 * @param transparentColor
 */
export function drawHeatmapGradient(
   ctx: CanvasRenderingContext2D,
   cx: number,
   cy: number,
   size: number,
   color: string,
   transparentColor: string,
): void {
   const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size)
   gradient.addColorStop(0, color)
   gradient.addColorStop(1, transparentColor)

   ctx.fillStyle = gradient
   ctx.beginPath()
   ctx.arc(cx, cy, size, 0, 2 * Math.PI)
   ctx.fill()
}