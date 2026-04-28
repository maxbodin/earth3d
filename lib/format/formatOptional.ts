import { N_A_VALUE } from '@/app/constants/strings'

export function formatOptional(value: number | string | null | undefined, suffix = ''): string {
   if (value == null) return N_A_VALUE
   return `${value}${suffix}`
}