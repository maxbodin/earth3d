export function parseBoolean(value: unknown): boolean {
   if (typeof value === 'boolean') return value

   if (typeof value === 'number') return value !== 0

   if (typeof value === 'string') {
      return value === 'true' || value === '1'
   }

   return false
}