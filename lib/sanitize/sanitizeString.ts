export const sanitizeString = (value: unknown, maxLength: number): string | null => {
   if (typeof value !== 'string') return null
   return value.trim().slice(0, maxLength)
}