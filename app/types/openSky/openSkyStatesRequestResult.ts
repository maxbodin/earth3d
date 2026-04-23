import { OpenSkyStatesResponse } from '@/app/types/openSky/openSkyStatesResponse'

export type OpenSkyStatesRequestResult = {
   response: OpenSkyStatesResponse
   authenticated: boolean
   ttlMs: number
   remainingTokens: number | null
}