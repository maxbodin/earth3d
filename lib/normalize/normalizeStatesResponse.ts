import { normalizeStateVector } from '@/lib/normalize/normalizeStateVector'
import { OpenSkyStatesResponse } from '@/app/types/openSky/openSkyStatesResponse'
import { parseNumber } from '@/lib/parse/parseNumber'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'

export function normalizeStatesResponse(rawResponse: unknown): OpenSkyStatesResponse {
   const fallbackResponse: OpenSkyStatesResponse = {
      time: Math.floor(Date.now() / 1000),
      states: [],
   }

   if (rawResponse == null || typeof rawResponse !== 'object') {
      return fallbackResponse
   }

   const candidate = rawResponse as Record<string, unknown>
   const time = parseNumber(candidate.time)

   const states = Array.isArray(candidate.states)
      ? candidate.states
         .map((stateValue) => normalizeStateVector(stateValue))
         .filter((stateValue): stateValue is OpenSkyStateVector => stateValue != null)
      : []

   return {
      time: time ?? fallbackResponse.time,
      states,
   }
}