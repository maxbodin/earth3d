import { parseNumber } from '@/lib/parse/parseNumber'
import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'

export function parseBBox(searchParams: URLSearchParams): Partial<OpenSkyBoundingBox> | null {
   const lamin = parseNumber(searchParams.get('lamin'))
   const lomin = parseNumber(searchParams.get('lomin'))
   const lamax = parseNumber(searchParams.get('lamax'))
   const lomax = parseNumber(searchParams.get('lomax'))

   if (lamin == null || lomin == null || lamax == null || lomax == null) {
      return null
   }

   return {
      lamin,
      lomin,
      lamax,
      lomax,
   }
}