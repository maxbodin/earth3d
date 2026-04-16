export interface AirportAttributes {
   OBJECTID?: number | null
   id?: number | null
   ident?: string | null
   type?: string | null
   name?: string | null
   latitude_deg?: number | null
   longitude_deg?: number | null
   elevation_ft?: number | null
   continent?: string | null
   iso_country?: string | null
   iso_region?: string | null
   municipality?: string | null
   scheduled_service?: string | null
   gps_code?: string | null
   iata_code?: string | null
   local_code?: string | null
   home_link?: string | null
   wikipedia_link?: string | null
   keywords?: string | null
   description?: string | null
   frequency_mhz?: number | null
   length_ft?: number | null
   width_ft?: number | null
   surface?: string | null
   lighted?: number | null
   closed?: number | null
}

export interface AirportFeature {
   attributes: AirportAttributes
}

export interface AirportsDataset {
   layers?: Array<{
      featureSet?: {
         features?: AirportFeature[]
      }
   }>
}

export interface AirportSearchSuggestion {
   key: string
   label: string
   description: string
   feature: AirportFeature
}
