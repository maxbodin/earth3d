export interface VesselMessage {
   mmsi?: number
   name?: string
   time_utc?: string
   callsign?: string
   destination?: string
   dimension?: unknown
   eta?: string
   imo?: string
   cargo_type_code?: string
   cog?: number
   sog?: number
   hdg?: number
   location?: { coordinates?: unknown }
}