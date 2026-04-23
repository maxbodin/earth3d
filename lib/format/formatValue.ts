import { N_A_VALUE } from '@/app/constants/strings'

export const formatValue = (value: string | number | null): string => {
   if (value == null || value === '') {
      return N_A_VALUE
   }

   return String(value)
}