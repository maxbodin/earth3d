import { Feature } from '@/app/types/orsTypes'

export function isFeature(value: unknown): value is Feature {
   if (value == null || typeof value !== 'object') return false

   const candidate = value as Feature
   return Array.isArray(candidate.geometry?.coordinates) && candidate.properties != null
}