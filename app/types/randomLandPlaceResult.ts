import { Feature } from '@/app/types/orsTypes'
import { Coordinates } from '@/app/types/coordinates/coordinates'

export interface RandomLandPlaceResult {
   feature: Feature
   coordinates: Coordinates
}