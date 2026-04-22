import { N_A_VALUE } from '@/app/constants/strings'

export function formatNumber(value: number | null): string {
   if (value == null || !Number.isFinite(value)) {
      return N_A_VALUE
   }

   return new Intl.NumberFormat().format(value)
}