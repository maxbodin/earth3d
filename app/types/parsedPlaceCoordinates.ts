import { Coordinates } from '@/app/types/coordinates/coordinates'

export interface ParsedPlaceCoordinates extends Coordinates {
   hasValidCoordinates: boolean
   strLatitude: string
   strLongitude: string
}