import { Coordinates } from '@/app/types/coordinates'
import { normalizeCoordinates } from '@/lib/normalize/normalizeCoordinates'

export function parseCoordinatesFromUnknown(rawCoordinates: unknown): Coordinates | null {
   if (rawCoordinates == null) return null

   if (!Array.isArray(rawCoordinates) && typeof rawCoordinates === 'object') {
      const candidate = rawCoordinates as Partial<Coordinates>
      return normalizeCoordinates(candidate.latitude, candidate.longitude)
   }

   if (!Array.isArray(rawCoordinates)) return null

   if (rawCoordinates.length >= 2) {
      const directCoordinates = normalizeCoordinates(
         rawCoordinates[1],
         rawCoordinates[0],
      )
      if (directCoordinates != null) {
         return directCoordinates
      }
   }

   const latestCoordinates = rawCoordinates.at(-1)
   if (!Array.isArray(latestCoordinates) || latestCoordinates.length < 2) {
      return null
   }

   return normalizeCoordinates(latestCoordinates[1], latestCoordinates[0])
}