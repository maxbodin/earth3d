import { N_A_VALUE } from '@/app/constants/strings'
import { Feature } from '@/app/types/orsTypes'
import { ParsedPlaceCoordinates } from '@/app/types/parsedPlaceCoordinates'
import { Coordinates } from '@/app/types/coordinates'

export function isFeature(value: unknown): value is Feature {
   if (value == null || typeof value !== 'object') return false

   const candidate = value as Feature
   return Array.isArray(candidate.geometry?.coordinates) && candidate.properties != null
}

export function normalizeDisplayValue(value: unknown): string {
   if (value == null) return N_A_VALUE

   const stringValue = String(value).trim()
   return stringValue.length > 0 ? stringValue : N_A_VALUE
}

export function mergeDisplayValues(primary: string, suffix: string): string {
   const hasPrimary = primary !== N_A_VALUE
   const hasSuffix = suffix !== N_A_VALUE

   if (hasPrimary && hasSuffix) {
      return `${primary} ${suffix}`
   }

   if (hasPrimary) {
      return primary
   }

   if (hasSuffix) {
      return suffix
   }

   return N_A_VALUE
}

export function parsePlaceCoordinates(feature: Feature): ParsedPlaceCoordinates {
   const latitudeRaw = Number(feature.geometry.coordinates?.[1])
   const longitudeRaw = Number(feature.geometry.coordinates?.[0])
   const hasValidCoordinates =
      Number.isFinite(latitudeRaw) && Number.isFinite(longitudeRaw)

   const latitude = hasValidCoordinates ? latitudeRaw : NaN
   const longitude = hasValidCoordinates ? longitudeRaw : NaN

   return {
      hasValidCoordinates,
      latitude,
      longitude,
      strLatitude: hasValidCoordinates ? latitude.toFixed(3) : N_A_VALUE,
      strLongitude: hasValidCoordinates ? longitude.toFixed(3) : N_A_VALUE,
   }
}

export function getAntipodeCoordinates(
   latitude: number,
   longitude: number,
): Coordinates {
   const oppositeLatitude = -latitude
   let oppositeLongitude = longitude + 180

   if (oppositeLongitude > 180) {
      oppositeLongitude -= 360
   }

   return {
      latitude: oppositeLatitude,
      longitude: oppositeLongitude,
   }
}
