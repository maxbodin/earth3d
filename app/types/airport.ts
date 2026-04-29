export interface AirportAttributes {
   OBJECTID?: number | null
   closed?: number | null
   continent?: string | null
   description?: string | null
   elevation_ft?: number | null
   frequency_mhz?: number | null
   gps_code?: string | null
   home_link?: string | null
   iata_code?: string | null
   id?: number | null
   ident?: string | null
   iso_country?: string | null
   iso_region?: string | null
   keywords?: string | null
   latitude_deg?: number | null
   length_ft?: number | null
   lighted?: number | null
   local_code?: string | null
   longitude_deg?: number | null
   municipality?: string | null
   name?: string | null
   scheduled_service?: string | null
   surface?: string | null
   type?: string | null
   width_ft?: number | null
   wikipedia_link?: string | null
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
