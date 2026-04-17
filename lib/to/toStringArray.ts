import { toNullableString } from '@/lib/to/toNullableString'

export function toStringArray(value: unknown): string[] {
   if (!Array.isArray(value)) {
      return []
   }

   return value
      .map((item: unknown): string | null => toNullableString(item))
      .filter((item: string | null): item is string => item != null)
}