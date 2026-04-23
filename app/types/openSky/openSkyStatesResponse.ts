import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'

export type OpenSkyStatesResponse = {
   time: number
   states: OpenSkyStateVector[] | null
}