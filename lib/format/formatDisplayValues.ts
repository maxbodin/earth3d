import { N_A_VALUE } from '@/app/constants/strings'

export function formatDisplayValues(primary: string, suffix: string, wrap: 'space' | 'parens' = 'space'): string {
   const hasPrimary = primary !== N_A_VALUE
   const hasSuffix = suffix !== N_A_VALUE

   if (hasPrimary && hasSuffix) {
      return wrap === 'parens' ? `${primary} (${suffix})` : `${primary} ${suffix}`
   }

   if (hasPrimary) {
      return primary
   }

   if (hasSuffix) {
      return suffix
   }

   return N_A_VALUE
}