import { N_A_VALUE } from '@/app/constants/strings'

export function formatDecimal(value: number | null): string {
   if (value == null || !Number.isFinite(value)) {
      return N_A_VALUE
   }

   return value.toFixed(1)
}