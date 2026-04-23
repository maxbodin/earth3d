import { OpenSkyTrackResponse } from '@/app/types/openSky/openSkyTrackResponse'
import { parseNumber } from '@/lib/parse/parseNumber'
import { parseBoolean } from '@/lib/parse/parseBoolean'

export function normalizeTrack(rawTrack: unknown): OpenSkyTrackResponse | null {
   if (rawTrack == null || typeof rawTrack !== 'object') return null

   const candidate = rawTrack as Record<string, unknown>
   const icao24 =
      typeof candidate.icao24 === 'string'
         ? candidate.icao24.toLowerCase()
         : null

   const startTime = parseNumber(candidate.startTime)
   const endTime = parseNumber(candidate.endTime)

   if (icao24 == null || startTime == null || endTime == null) {
      return null
   }

   const path = Array.isArray(candidate.path)
      ? candidate.path
         .map((point): OpenSkyTrackResponse['path'][number] | null => {
            if (!Array.isArray(point)) return null

            const time = parseNumber(point[0])
            if (time == null) return null

            return [
               time,
               parseNumber(point[1]),
               parseNumber(point[2]),
               parseNumber(point[3]),
               parseNumber(point[4]),
               parseBoolean(point[5]),
            ]
         })
         .filter((point): point is OpenSkyTrackResponse['path'][number] => point != null)
      : []

   return {
      icao24,
      startTime,
      endTime,
      callsign: typeof candidate.callsign === 'string' ? candidate.callsign : null,
      path,
   }
}