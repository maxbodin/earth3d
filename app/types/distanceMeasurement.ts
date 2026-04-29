import { Coordinates } from '@/app/types/coordinates/coordinates'
import { Marker } from '@/app/types/marker'

export interface DistanceMeasurement {
   markerA: Marker
   markerB: Marker
   midpoint: Coordinates
   distanceKm: number
   color: string
}