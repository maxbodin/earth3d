import { MAX_LATITUDE, MAX_LONGITUDE, MIN_LATITUDE, MIN_LONGITUDE, } from '@/app/constants/numbers'
import { sanitizeString } from '@/lib/sanitize/sanitizeString'
import { isValidLatitude } from '@/lib/isValid/isValidLatitude'
import { isValidLongitude } from '@/lib/isValid/isValidLongitude'
import { normalizeColor } from '@/lib/normalize/normalizeColor'

const MAX_FILE_SIZE_BYTES = 1_048_576 // 1 MB
const MAX_MARKER_COUNT = 500
const MAX_STRING_LENGTH = 500
const ALLOWED_JSON_MIME_TYPE = 'application/json'

interface RawMarkerEntry {
   name?: unknown
   address?: unknown
   latitude?: unknown
   longitude?: unknown
   color?: unknown
}

export interface ValidatedMarkerEntry {
   name: string
   address: string
   latitude: number
   longitude: number
   color: string
}

export type MarkerImportResult =
   | { ok: true; markers: ValidatedMarkerEntry[] }
   | { ok: false; error: string }

const validateEntry = (raw: RawMarkerEntry, index: number): ValidatedMarkerEntry | string => {
   if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      return `Marker at index ${index} is not an object.`
   }

   const name = sanitizeString(raw.name, MAX_STRING_LENGTH)
   if (name == null) {
      return `Marker at index ${index}: "name" must be a string.`
   }

   const address = sanitizeString(raw.address, MAX_STRING_LENGTH) ?? ''

   if (typeof raw.latitude !== 'number' || !isValidLatitude(raw.latitude)) {
      return `Marker at index ${index}: "latitude" must be a number between ${MIN_LATITUDE} and ${MAX_LATITUDE}.`
   }

   if (typeof raw.longitude !== 'number' || !isValidLongitude(raw.longitude)) {
      return `Marker at index ${index}: "longitude" must be a number between ${MIN_LONGITUDE} and ${MAX_LONGITUDE}.`
   }

   let color = ''
   if (raw.color !== undefined) {
      if (typeof raw.color !== 'string') {
         return `Marker at index ${index}: "color" must be a hex color (e.g. #FF00AA or 0xFF00AA).`
      }

      const normalized = normalizeColor(raw.color)
      if (normalized == null) {
         return `Marker at index ${index}: "color" must be a hex color (e.g. #FF00AA or 0xFF00AA).`
      }

      color = normalized
   }

   return {
      name,
      address,
      latitude: raw.latitude,
      longitude: raw.longitude,
      color,
   }
}

export const validateMarkerFile = (file: File): string | null => {
   if (file.type !== '' && file.type !== ALLOWED_JSON_MIME_TYPE) {
      return 'File must be a JSON file.'
   }

   if (!file.name.endsWith('.json')) {
      return 'File must have a .json extension.'
   }

   if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024} KB.`
   }

   return null
}

export const parseMarkerJson = (raw: string): MarkerImportResult => {
   let parsed: unknown

   try {
      parsed = JSON.parse(raw)
   } catch {
      return { ok: false, error: 'File content is not valid JSON.' }
   }

   if (!Array.isArray(parsed)) {
      return { ok: false, error: 'JSON must be an array of markers.' }
   }

   if (parsed.length === 0) {
      return { ok: false, error: 'JSON array is empty.' }
   }

   if (parsed.length > MAX_MARKER_COUNT) {
      return { ok: false, error: `Too many markers. Maximum is ${MAX_MARKER_COUNT}.` }
   }

   const markers: ValidatedMarkerEntry[] = []

   for (let i = 0; i < parsed.length; i++) {
      const result = validateEntry(parsed[i] as RawMarkerEntry, i)

      if (typeof result === 'string') {
         return { ok: false, error: result }
      }

      markers.push(result)
   }

   return { ok: true, markers }
}
