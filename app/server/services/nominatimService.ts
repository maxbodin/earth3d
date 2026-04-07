'use server'
const NOMINATIM_API_URL: string = 'https://nominatim.openstreetmap.org'

/**
 * Helper function to handle the fetch requests.
 */
const fetchFromNominatim = async (endpoint: string, params: Record<string, string>) => {
   const queryString: string = new URLSearchParams(params).toString()
   const url: string = `${NOMINATIM_API_URL}${endpoint}?${queryString}`

   try {
      const response: Response = await fetch(url)

      if (!response.ok) {
         throw new Error(`Failed to fetch data from Nominatim API: ${response.statusText}`)
      }

      return await response.json()
   } catch (error: any) {
      throw new Error(`Error: ${error.message}`)
   }
}

/**
 * Search for OSM objects by name or type.
 * @param query - Free-form or structured query (e.g., `q`, `city`, `amenity`, etc.)
 * @param options - Additional query parameters like `format`, `limit`, `polygon_geojson`, etc.
 */
export const searchOSM = async (query: string, options: Record<string, string> = {}): Promise<any> => {
   const params = {
      q: query,
      format: options.format || 'json',
      limit: options.limit || '10',
      addressdetails: options.addressdetails || '1',
      extratags: '1',
      namedetails: '1',
      polygon_geojson: options.polygon_geojson || '0',
      ...options,
   }

   return fetchFromNominatim('/search', params)
}

/**
 * Reverse geocode to get details from lat/lon.
 * @param lat - Latitude.
 * @param lon - Longitude.
 * @param options - Additional query parameters like `format`, `zoom`, `addressdetails`, etc.
 */
export const reverseOSM = async (lat: number, lon: number, options: Record<string, string> = {}): Promise<any> => {
   const params = {
      lat: lat.toString(),
      lon: lon.toString(),
      format: options.format || 'json',
      zoom: options.zoom || '18',
      addressdetails: options.addressdetails || '1',
      ...options,
   }

   return fetchFromNominatim('/reverse', params)
}

/**
 * Lookup OSM object details by ID.
 * @param osm_ids - Comma-separated list of OSM IDs (with type, e.g., `W123`, `N456`).
 * @param options - Additional query parameters like `format`, `addressdetails`, etc.
 */
export const lookupOSM = async (osm_ids: string, options: Record<string, string> = {}): Promise<any> => {
   const params = {
      osm_ids,
      format: options.format || 'json',
      addressdetails: options.addressdetails || '1',
      ...options,
   }

   return fetchFromNominatim('/lookup', params)
}