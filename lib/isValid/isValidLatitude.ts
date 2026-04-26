import { MAX_LATITUDE, MIN_LATITUDE } from '@/app/constants/numbers'

export const isValidLatitude = (value: number): boolean =>
   Number.isFinite(value) && value >= MIN_LATITUDE && value <= MAX_LATITUDE
