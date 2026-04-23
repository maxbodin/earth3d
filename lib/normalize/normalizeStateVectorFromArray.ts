import { toNullableString } from '@/lib/to/toNullableString'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { parseNumber } from '@/lib/parse/parseNumber'
import { parseBoolean } from '@/lib/parse/parseBoolean'
import { parseSensors } from '@/lib/parse/parseSensors'

export function normalizeStateVectorFromArray(rawState: unknown[]): OpenSkyStateVector | null {
   const icao24 = toNullableString(rawState[0])?.trim().toLowerCase() ?? null
   const originCountry = toNullableString(rawState[2])?.trim() ?? null

   if (icao24 == null || icao24.length === 0 || originCountry == null || originCountry.length === 0) {
      return null
   }

   const callsignRaw = toNullableString(rawState[1])
   const callsign = callsignRaw != null && callsignRaw.trim().length > 0
      ? callsignRaw.trim()
      : null

   return [
      icao24,
      callsign,
      originCountry,
      parseNumber(rawState[3]),
      parseNumber(rawState[4]),
      parseNumber(rawState[5]),
      parseNumber(rawState[6]),
      parseNumber(rawState[7]),
      parseBoolean(rawState[8]),
      parseNumber(rawState[9]),
      parseNumber(rawState[10]),
      parseNumber(rawState[11]),
      parseSensors(rawState[12]),
      parseNumber(rawState[13]),
      toNullableString(rawState[14]),
      parseBoolean(rawState[15]),
      parseNumber(rawState[16]),
      parseNumber(rawState[17]),
   ]
}