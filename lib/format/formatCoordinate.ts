import { N_A_VALUE } from '@/app/constants/strings'

export function formatCoordinate(value: number): string {
   return Number.isFinite(value) ? value.toFixed(3) : N_A_VALUE
}