export function toNullableNumber(value: unknown): number | null {
   if (typeof value === 'number' && Number.isFinite(value)) {
      return value
   }

   if (typeof value === 'string') {
      const parsedNumber = Number(value)
      return Number.isFinite(parsedNumber) ? parsedNumber : null
   }

   return null
}