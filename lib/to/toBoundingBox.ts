import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'
import { clamp } from '@/lib/math/clamp'
import { DEFAULT_BBOX } from '@/app/constants/numbers'

export function toBoundingBox(
   centerLatitude: number,
   centerLongitude: number,
   latitudeHalfSpan: number,
   longitudeHalfSpan: number,
): OpenSkyBoundingBox {
   const lamin = clamp(centerLatitude - latitudeHalfSpan, -90, 90)
   const lamax = clamp(centerLatitude + latitudeHalfSpan, -90, 90)
   const lomin = clamp(centerLongitude - longitudeHalfSpan, -180, 180)
   const lomax = clamp(centerLongitude + longitudeHalfSpan, -180, 180)

   if (lamin >= lamax || lomin >= lomax) {
      return DEFAULT_BBOX
   }

   return { lamin, lomin, lamax, lomax }
}