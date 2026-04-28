export interface EarthquakeQueryParams {
   starttime?: string
   endtime?: string
   minmagnitude?: number
   maxmagnitude?: number
   mindepth?: number
   maxdepth?: number
   limit?: number
   orderby?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc'
}