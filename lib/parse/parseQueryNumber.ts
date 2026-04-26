export function parseQueryNumber(value: string | null): number | null {
   if (value == null) {
      return null
   }

   const parsedValue = Number(value)
   return Number.isFinite(parsedValue) ? parsedValue : null
}