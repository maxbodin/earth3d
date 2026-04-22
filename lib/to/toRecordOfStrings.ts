import { toNullableString } from '@/lib/to/toNullableString'

export function toRecordOfStrings(value: unknown): Record<string, string> {
   if (value == null || typeof value !== 'object' || Array.isArray(value)) {
      return {}
   }

   const typedObject = value as Record<string, unknown>
   const result: Record<string, string> = {}

   for (const [key, itemValue] of Object.entries(typedObject)) {
      const normalizedValue = toNullableString(itemValue)
      if (normalizedValue != null) {
         result[key] = normalizedValue
      }
   }

   return result
}