import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'
import { parseNumber } from '@/lib/parse/parseNumber'
import {
   DEFAULT_BBOX,
   MAX_LATITUDE,
   MAX_LATITUDE_SPAN,
   MAX_LONGITUDE,
   MAX_LONGITUDE_SPAN,
   MIN_LATITUDE,
   MIN_LONGITUDE
} from '@/app/constants/numbers'
import { clamp } from '@/lib/clamp'

export function normalizeBBox(rawBBox: Partial<OpenSkyBoundingBox> | null | undefined): OpenSkyBoundingBox {
   const lamin = parseNumber(rawBBox?.lamin)
   const lomin = parseNumber(rawBBox?.lomin)
   const lamax = parseNumber(rawBBox?.lamax)
   const lomax = parseNumber(rawBBox?.lomax)

   if (lamin == null || lomin == null || lamax == null || lomax == null) {
      return DEFAULT_BBOX
   }

   const rawMinLat = clamp(Math.min(lamin, lamax), MIN_LATITUDE, MAX_LATITUDE)
   const rawMaxLat = clamp(Math.max(lamin, lamax), MIN_LATITUDE, MAX_LATITUDE)
   const rawMinLon = clamp(Math.min(lomin, lomax), MIN_LONGITUDE, MAX_LONGITUDE)
   const rawMaxLon = clamp(Math.max(lomin, lomax), MIN_LONGITUDE, MAX_LONGITUDE)

   const latitudeSpan = Math.max(rawMaxLat - rawMinLat, 0.1)
   const longitudeSpan = Math.max(rawMaxLon - rawMinLon, 0.1)

   const latitudeScale = Math.min(1, MAX_LATITUDE_SPAN / latitudeSpan)
   const longitudeScale = Math.min(1, MAX_LONGITUDE_SPAN / longitudeSpan)

   const scale = Math.min(latitudeScale, longitudeScale)

   if (scale >= 1) {
      return {
         lamin: rawMinLat,
         lomin: rawMinLon,
         lamax: rawMaxLat,
         lomax: rawMaxLon,
      }
   }

   const centerLat = (rawMinLat + rawMaxLat) / 2
   const centerLon = (rawMinLon + rawMaxLon) / 2

   const halfLatSpan = (latitudeSpan * scale) / 2
   const halfLonSpan = (longitudeSpan * scale) / 2

   return {
      lamin: clamp(centerLat - halfLatSpan, MIN_LATITUDE, MAX_LATITUDE),
      lomin: clamp(centerLon - halfLonSpan, MIN_LONGITUDE, MAX_LONGITUDE),
      lamax: clamp(centerLat + halfLatSpan, MIN_LATITUDE, MAX_LATITUDE),
      lomax: clamp(centerLon + halfLonSpan, MIN_LONGITUDE, MAX_LONGITUDE),
   }
}