import airportsDataJson from '@/app/data/Airports.json'
import { AirportAttributes, AirportFeature, AirportsDataset, AirportSearchSuggestion, } from '@/app/types/airport'

interface AirportSearchEntry {
   key: string
   label: string
   description: string
   feature: AirportFeature
   normalizedName: string
   normalizedLocation: string
   normalizedCodes: string[]
   searchableText: string
}

interface RankedAirportSearchEntry {
   score: number
   entry: AirportSearchEntry
}

const DEFAULT_SEARCH_LIMIT = 20
const INTERNAL_RESULTS_MULTIPLIER = 6
const MIN_INTERNAL_RESULTS = 120

let cachedAirportSearchEntries: AirportSearchEntry[] | null = null
let cachedAirportCodeIndex: Map<string, AirportSearchEntry[]> | null = null

function normalizeSearchText(value: unknown): string {
   if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toString().toLowerCase()
   }

   if (typeof value !== 'string') {
      return ''
   }

   return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
}

function getAirportDisplayLabel(attributes: AirportAttributes): string {
   const name = attributes.name?.trim()
   const ident = attributes.ident?.trim()
   const iataCode = attributes.iata_code?.trim()

   if (name != null && name.length > 0) {
      if (ident != null && ident.length > 0) {
         return `${name} (${ident})`
      }

      if (iataCode != null && iataCode.length > 0) {
         return `${name} (${iataCode})`
      }

      return name
   }

   if (ident != null && ident.length > 0) {
      return ident
   }

   if (iataCode != null && iataCode.length > 0) {
      return iataCode
   }

   return 'Unknown Airport'
}

function getAirportDescription(attributes: AirportAttributes): string {
   const segments: string[] = []

   const ident = attributes.ident?.trim()
   if (ident != null && ident.length > 0) {
      segments.push(`ICAO ${ident}`)
   }

   const iataCode = attributes.iata_code?.trim()
   if (iataCode != null && iataCode.length > 0) {
      segments.push(`IATA ${iataCode}`)
   }

   const municipality = attributes.municipality?.trim()
   if (municipality != null && municipality.length > 0) {
      segments.push(municipality)
   }

   const region = attributes.iso_region?.trim()
   if (region != null && region.length > 0) {
      segments.push(region)
   }

   const country = attributes.iso_country?.trim()
   if (country != null && country.length > 0) {
      segments.push(country)
   }

   return segments.join(' • ')
}

function getAirportKey(attributes: AirportAttributes, fallbackIndex: number): string {
   const preferredKey =
      attributes.id ??
      attributes.OBJECTID ??
      attributes.ident ??
      attributes.gps_code ??
      fallbackIndex

   return String(preferredKey)
}

function compareRankedEntries(
   leftEntry: RankedAirportSearchEntry,
   rightEntry: RankedAirportSearchEntry,
): number {
   if (leftEntry.score !== rightEntry.score) {
      return leftEntry.score - rightEntry.score
   }

   const labelComparison = leftEntry.entry.label.localeCompare(rightEntry.entry.label)
   if (labelComparison !== 0) {
      return labelComparison
   }

   return leftEntry.entry.key.localeCompare(rightEntry.entry.key)
}

function getSearchScore(entry: AirportSearchEntry, query: string): number {
   if (entry.normalizedCodes.includes(query)) {
      return 0
   }

   if (entry.normalizedCodes.some(code => code.startsWith(query))) {
      return 1
   }

   if (entry.normalizedName === query) {
      return 2
   }

   if (entry.normalizedName.startsWith(query)) {
      return 3
   }

   if (entry.normalizedLocation.startsWith(query)) {
      return 4
   }

   if (entry.searchableText.includes(query)) {
      return 5
   }

   return 10
}

function matchesAllTokens(entry: AirportSearchEntry, tokens: string[]): boolean {
   return tokens.every(token => {
      if (entry.searchableText.includes(token)) {
         return true
      }

      return entry.normalizedCodes.some(code => code.startsWith(token))
   })
}

function addRankedEntry(
   rankedEntries: RankedAirportSearchEntry[],
   nextEntry: RankedAirportSearchEntry,
   maxInternalResults: number,
): void {
   rankedEntries.push(nextEntry)
   rankedEntries.sort(compareRankedEntries)

   if (rankedEntries.length > maxInternalResults) {
      rankedEntries.length = maxInternalResults
   }
}

function ensureAirportSearchCache(): {
   entries: AirportSearchEntry[]
   codeIndex: Map<string, AirportSearchEntry[]>
} {
   if (cachedAirportSearchEntries != null && cachedAirportCodeIndex != null) {
      return {
         entries: cachedAirportSearchEntries,
         codeIndex: cachedAirportCodeIndex,
      }
   }

   const airportsData = airportsDataJson as AirportsDataset
   const features = airportsData.layers?.[0]?.featureSet?.features ?? []

   const entries: AirportSearchEntry[] = []
   const codeIndex = new Map<string, AirportSearchEntry[]>()
   const usedKeys = new Set<string>()

   features.forEach((feature: AirportFeature, index: number): void => {
      const attributes = feature.attributes ?? {}

      const normalizedCodes = Array.from(new Set([
         normalizeSearchText(attributes.ident),
         normalizeSearchText(attributes.iata_code),
         normalizeSearchText(attributes.gps_code),
         normalizeSearchText(attributes.local_code),
      ].filter(Boolean)))

      const normalizedName = normalizeSearchText(attributes.name)
      const normalizedLocation = normalizeSearchText([
         attributes.municipality,
         attributes.iso_region,
         attributes.iso_country,
         attributes.continent,
      ].filter(Boolean).join(' '))

      const searchableText = normalizeSearchText([
         attributes.ident,
         attributes.iata_code,
         attributes.gps_code,
         attributes.local_code,
         attributes.name,
         attributes.municipality,
         attributes.iso_region,
         attributes.iso_country,
         attributes.continent,
         attributes.type,
         attributes.keywords,
         attributes.description,
      ].filter(Boolean).join(' '))

      if (searchableText.length === 0) {
         return
      }

      let airportKey = getAirportKey(attributes, index)
      if (usedKeys.has(airportKey)) {
         airportKey = `${airportKey}-${index}`
      }
      usedKeys.add(airportKey)

      const entry: AirportSearchEntry = {
         key: airportKey,
         label: getAirportDisplayLabel(attributes),
         description: getAirportDescription(attributes),
         feature,
         normalizedName,
         normalizedLocation,
         normalizedCodes,
         searchableText,
      }

      entries.push(entry)

      normalizedCodes.forEach((code: string): void => {
         const entriesForCode = codeIndex.get(code)
         if (entriesForCode == null) {
            codeIndex.set(code, [entry])
            return
         }

         entriesForCode.push(entry)
      })
   })

   cachedAirportSearchEntries = entries
   cachedAirportCodeIndex = codeIndex

   return {
      entries,
      codeIndex,
   }
}

export function searchAirports(
   query: string,
   limit: number = DEFAULT_SEARCH_LIMIT,
): AirportSearchSuggestion[] {
   const normalizedQuery = normalizeSearchText(query)
   if (normalizedQuery.length === 0) {
      return []
   }

   const maxResults = Math.max(1, limit)
   const maxInternalResults = Math.max(
      MIN_INTERNAL_RESULTS,
      maxResults * INTERNAL_RESULTS_MULTIPLIER,
   )

   const { entries, codeIndex } = ensureAirportSearchCache()

   const tokens = normalizedQuery.split(/\s+/).filter(Boolean)
   const rankedEntries: RankedAirportSearchEntry[] = []
   const seenKeys = new Set<string>()

   const exactCodeEntries = codeIndex.get(normalizedQuery) ?? []
   exactCodeEntries.forEach((entry: AirportSearchEntry): void => {
      if (seenKeys.has(entry.key)) {
         return
      }

      addRankedEntry(
         rankedEntries,
         {
            score: 0,
            entry,
         },
         maxInternalResults,
      )

      seenKeys.add(entry.key)
   })

   entries.forEach((entry: AirportSearchEntry): void => {
      if (seenKeys.has(entry.key)) {
         return
      }

      if (!matchesAllTokens(entry, tokens)) {
         return
      }

      addRankedEntry(
         rankedEntries,
         {
            score: getSearchScore(entry, normalizedQuery),
            entry,
         },
         maxInternalResults,
      )

      seenKeys.add(entry.key)
   })

   return rankedEntries.slice(0, maxResults).map(({ entry }): AirportSearchSuggestion => {
      return {
         key: entry.key,
         label: entry.label,
         description: entry.description,
         feature: entry.feature,
      }
   })
}
