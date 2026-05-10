import { Eruption } from '@/app/types/volcano/eruption'
import { Volcano } from '@/app/types/volcano/volcano'

export interface VolcanoResponse {
   eruptions: Eruption[]
   items: Volcano[]
   totalCount: number
}
