import { N_A_VALUE } from '@/app/constants/strings'

export const formatTimestamp = (value: number | null): string => {
   if (value == null) {
      return N_A_VALUE
   }

   return new Date(value * 1000).toLocaleString()
}