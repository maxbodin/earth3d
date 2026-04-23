import { OpenSkyTrackWaypoint } from '@/app/types/openSky/openSkyTrackWaypoint'

export type OpenSkyTrackResponse = {
   icao24: string
   startTime: number
   endTime: number
   callsign: string | null
   path: OpenSkyTrackWaypoint[]
}