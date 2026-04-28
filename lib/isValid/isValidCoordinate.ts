import { isValidLongitude } from '@/lib/isValid/isValidLongitude'
import { isValidLatitude } from '@/lib/isValid/isValidLatitude'

export const isValidCoordinate = (lat: number, lon: number): boolean =>
   isValidLongitude(lon) && isValidLatitude(lat)