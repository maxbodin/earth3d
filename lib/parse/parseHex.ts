export function parseHex(hex: string): { r: number; g: number; b: number } {
   const n = parseInt(hex.slice(1), 16)
   return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}