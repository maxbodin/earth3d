import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { normalizeStateVectorFromArray } from '@/lib/normalize/normalizeStateVectorFromArray'

export function normalizeStateVector(rawState: unknown): OpenSkyStateVector | null {
   if (!Array.isArray(rawState) || rawState.length < 17) {
      return null
   }

   return normalizeStateVectorFromArray(rawState)
}