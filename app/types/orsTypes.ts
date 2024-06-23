/**
 * Main response type.
 */
export interface GeocodeResponse {
   geocoding: GeocodingInfo
   type: string
   features: Feature[]
   bbox: number[]
}

/**
 * Geocoding metadata information.
 */
interface GeocodingInfo {
   version: string
   attribution: string
   query: QueryDetails
   warnings: string[]
   engine: EngineInfo
   timestamp: number
}

/**
 * Query details type.
 */
interface QueryDetails {
   text: string
   parser: string
   parsed_text: ParsedText
   size: number
   layers: string[]
   private: boolean
   lang: LanguageInfo
   querySize: number
}

/**
 * Parsed text details.
 */
interface ParsedText {
   subject: string
   country: string
}

/**
 * Language details type.
 */
interface LanguageInfo {
   name: string
   iso6391: string
   iso6393: string
   via: string
   defaulted: boolean
}

/**
 * Engine information type.
 */
interface EngineInfo {
   name: string
   author: string
   version: string
}

/**
 * Feature type representing each geographical point.
 */
export interface Feature {
   type: string
   geometry: Geometry
   properties: FeatureProperties
   bbox?: number[]
}

/**
 * Geometry type representing the coordinates.
 */
interface Geometry {
   type: string
   coordinates: number[]
}

/**
 * Feature properties type.
 */
interface FeatureProperties {
   id: string
   gid: string
   layer: string
   source: string
   source_id: string
   name: string
   accuracy: string
   country: string
   country_gid: string
   country_a: string
   continent: string
   continent_gid: string
   label: string
   macroregion?: string
   macroregion_gid?: string
   region?: string
   region_gid?: string
   region_a?: string
   county?: string
   county_gid?: string
   macrocounty?: string
   macrocounty_gid?: string
   addendum?: Addendum
}

/**
 * Addendum type representing additional information.
 */
interface Addendum {
   geonames?: GeoNamesInfo
   concordances?: ConcordancesInfo
}

/**
 * GeoNames information type.
 */
interface GeoNamesInfo {
   feature_code: string
}

/**
 * Concordances type mapping different IDs and codes.
 */
interface ConcordancesInfo {
   [key: string]: string | number
}
