import { parseNumber } from '@/lib/parse/parseNumber'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { parseSelectedPlaneStateVector } from '@/lib/parse/parseSelectedPlaneStateVector'
import { toNullableString } from '@/lib/to/toNullableString'
import { parseBoolean } from '@/lib/parse/parseBoolean'
import { parseSensors } from '@/lib/parse/parseSensors'

export function normalizeStateVectorFromObject(
   rawState: Record<string, unknown>,
): OpenSkyStateVector | null {
   const nestedData = rawState.data === rawState ? null : rawState.data
   const nestedStateValue = rawState.state === rawState ? null : rawState.state
   const nestedVector = rawState.vector === rawState ? null : rawState.vector

   const nestedState = parseSelectedPlaneStateVector(nestedData)
      ?? parseSelectedPlaneStateVector(nestedStateValue)
      ?? parseSelectedPlaneStateVector(nestedVector)

   if (nestedState != null) {
      return nestedState
   }

   const icao24 = toNullableString(rawState.icao24)?.trim().toLowerCase() ?? null
   const originCountry = toNullableString(rawState.originCountry ?? rawState.origin_country)?.trim() ?? null

   if (icao24 == null || icao24.length === 0 || originCountry == null || originCountry.length === 0) {
      return null
   }

   const callsignRaw = toNullableString(rawState.callsign)
   const callsign = callsignRaw != null && callsignRaw.trim().length > 0
      ? callsignRaw.trim()
      : null

   return [
      icao24,
      callsign,
      originCountry,
      parseNumber(rawState.timePosition ?? rawState.time_position),
      parseNumber(rawState.lastContact ?? rawState.last_contact),
      parseNumber(rawState.longitude),
      parseNumber(rawState.latitude),
      parseNumber(rawState.baroAltitude ?? rawState.baro_altitude),
      parseBoolean(rawState.onGround ?? rawState.on_ground),
      parseNumber(rawState.velocity),
      parseNumber(rawState.trueTrack ?? rawState.true_track),
      parseNumber(rawState.verticalRate ?? rawState.vertical_rate),
      parseSensors(rawState.sensors),
      parseNumber(rawState.geoAltitude ?? rawState.geo_altitude),
      toNullableString(rawState.squawk),
      parseBoolean(rawState.spi),
      parseNumber(rawState.positionSource ?? rawState.position_source),
      parseNumber(rawState.category),
   ]
}