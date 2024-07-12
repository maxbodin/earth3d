/**
 * Main response type.
 */
export interface GeocodeResponse {
   bbox: number[]
   features: Feature[]
   geocoding: GeocodingInfo
   type: string
}

/**
 * Geocoding metadata information.
 */
interface GeocodingInfo {
   attribution: string
   engine: EngineInfo
   query: QueryDetails
   timestamp: number
   version: string
   warnings: string[]
}

/**
 * Query details type.
 */
interface QueryDetails {
   lang: LanguageInfo
   layers: string[]
   parsed_text: ParsedText
   parser: string
   private: boolean
   querySize: number
   size: number
   text: string
}

/**
 * Parsed text details.
 */
interface ParsedText {
   country: string
   subject: string
}

/**
 * Language details type.
 */
interface LanguageInfo {
   defaulted: boolean
   iso6391: string
   iso6393: string
   name: string
   via: string
}

/**
 * Engine information type.
 */
interface EngineInfo {
   author: string
   name: string
   version: string
}

/**
 * Feature type representing each geographical point.
 */
export interface Feature {
   bbox?: number[]
   geometry: Geometry
   properties: FeatureProperties
   type: string
}

/**
 * Geometry type representing the coordinates.
 */
interface Geometry {
   coordinates: number[]
   type: string
}

/**
 * Feature properties type.
 */
interface FeatureProperties {
   accuracy: string
   addendum?: Addendum
   continent: string
   continent_gid: string
   country: string
   country_a: string
   country_gid: string
   county?: string
   county_gid?: string
   gid: string
   id: string
   label: string
   layer: string
   localadmin: string
   localadmin_gid: string
   locality: string
   locality_gid: string
   macrocounty?: string
   macrocounty_gid?: string
   macroregion?: string
   macroregion_a: string
   macroregion_gid?: string
   name: string
   region?: string,
   region_a?: string,
   region_gid?: string,
   source: string,
   source_id: string,
}

/**
 * Addendum type representing additional information.
 */
interface Addendum {
   concordances?: ConcordancesInfo
   geonames?: GeoNamesInfo
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
