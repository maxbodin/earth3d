export function parseNumber(value: unknown | string | null): number | null {
   if (typeof value === 'number' && Number.isFinite(value)) {
      return value
   }

   if (typeof value === 'string' && value.trim().length > 0) {
      const parsedValue = Number(value)
      return Number.isFinite(parsedValue) ? parsedValue : null
   }

   if (value == null) return null

   const parsedValue = Number(value)
   return Number.isFinite(parsedValue) ? parsedValue : null
}