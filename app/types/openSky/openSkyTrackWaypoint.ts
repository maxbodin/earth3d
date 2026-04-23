export type OpenSkyTrackWaypoint = [
   time: number,
   latitude: number | null,
   longitude: number | null,
   baroAltitude: number | null,
   trueTrack: number | null,
   onGround: boolean,
]