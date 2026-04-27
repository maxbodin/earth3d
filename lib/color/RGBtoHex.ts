/**
 * Helper function to convert RGB values to hex.
 * @param r
 * @param g
 * @param b
 */
export const RGBtoHex = (r: number, g: number, b: number) => '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)