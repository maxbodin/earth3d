import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'

export type PlaneStatesApiResponse = {
   time: number
   states: OpenSkyStateVector[]
   meta: {
      source: 'live' | 'cache' | 'stale-cache'
      fetchedAt: number
      ttlMs: number
      retryAfterSeconds: number | null
      authenticated: boolean
      requestCost: number
      normalizedBBox: OpenSkyBoundingBox
   }
}