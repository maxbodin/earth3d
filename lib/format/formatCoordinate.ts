import { N_A_VALUE } from '@/app/constants/strings'

export function formatCoordinate(value: number | null | unknown): string {
   return ( typeof value == "number" && Number.isFinite(value)) ? value.toFixed(3) : N_A_VALUE
}