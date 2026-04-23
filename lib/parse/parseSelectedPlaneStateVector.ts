import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { normalizeStateVectorFromArray } from '@/lib/normalize/normalizeStateVectorFromArray'
import { normalizeStateVectorFromObject } from '@/lib/normalize/normalizeStateVectorFromObject'

export function parseSelectedPlaneStateVector(selection: unknown): OpenSkyStateVector | null {
   if (Array.isArray(selection)) {
      return normalizeStateVectorFromArray(selection)
   }

   if (selection == null || typeof selection !== 'object') {
      return null
   }

   return normalizeStateVectorFromObject(selection as Record<string, unknown>)
}