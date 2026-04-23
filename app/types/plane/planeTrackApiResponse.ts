import { OpenSkyTrackResponse } from '@/app/types/openSky/openSkyTrackResponse'

export type PlaneTrackApiResponse = {
   track: OpenSkyTrackResponse | null
   meta: {
      source: 'live' | 'cache' | 'stale-cache'
      fetchedAt: number
      ttlMs: number
      retryAfterSeconds: number | null
      authenticated: boolean
   }
}