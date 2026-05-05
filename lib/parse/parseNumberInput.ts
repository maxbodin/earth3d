/**
 * Parses a raw text input value to a finite number, or returns `null` if invalid.
 * @param rawValue
 */
export const parseNumberInput = (rawValue: string): number | null => {
   const normalizedValue = rawValue.trim().replace(',', '.')

   if (
      normalizedValue === ''
      || normalizedValue === '-'
      || normalizedValue === '+'
      || normalizedValue === '.'
      || normalizedValue === '-.'
      || normalizedValue === '+.'
   ) {
      return null
   }

   const parsedValue = Number(normalizedValue)

   return Number.isFinite(parsedValue)
      ? parsedValue
      : null
}