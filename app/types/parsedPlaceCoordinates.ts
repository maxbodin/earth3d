import { Coordinates } from '@/app/types/coordinates'


export interface ParsedPlaceCoordinates extends Coordinates {
   hasValidCoordinates: boolean
   strLatitude: string
   strLongitude: string
}