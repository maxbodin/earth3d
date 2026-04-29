import { N_A_VALUE } from '@/app/constants/strings'

export const formatValue = (value: string | number | null | unknown): string => {
   if (value == null || value === '') {
      return N_A_VALUE
   }

   const stringValue = String(value).trim()
   return stringValue.length > 0 ? stringValue : N_A_VALUE
}