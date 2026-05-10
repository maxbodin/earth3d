import { Eruption } from '@/app/types/volcano/eruption'

export interface NoaaVolcanoResponse {
   items: Eruption[]
   itemsPerPage: number
   page: number
   totalItems: number
   totalPages: number
}
