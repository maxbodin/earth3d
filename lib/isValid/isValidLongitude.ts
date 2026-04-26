import { MAX_LONGITUDE, MIN_LONGITUDE } from '@/app/constants/numbers'

export const isValidLongitude = (value: number): boolean =>
   Number.isFinite(value) && value >= MIN_LONGITUDE && value <= MAX_LONGITUDE
