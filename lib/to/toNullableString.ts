export function toNullableString(value: unknown): string | null {
   if (typeof value !== 'string') {
      return null
   }

   const trimmedValue = value.trim()
   return trimmedValue.length > 0 ? trimmedValue : null
}