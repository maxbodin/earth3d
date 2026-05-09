export interface NoaaVolcanoEruption {
   agent: string | null
   country: string
   deaths: number | null
   deathsAmountOrder: number | null
   deathsAmountOrderTotal: number | null
   deathsTotal: number | null
   elevation: number | null
   eruption: boolean | null
   id: number
   latitude: number
   location: string
   longitude: number
   month: number | null
   morphology: string
   name: string
   publish: boolean | null
   significant: boolean | null
   status: string | null
   timeErupt: string | null
   vei: number | null
   volcanoLocationId: number
   volcanoLocationNewNum: number | null
   volcanoLocationNum: string | null
   year: number | null
}

export interface NoaaVolcanoResponse {
   items: NoaaVolcanoEruption[]
   itemsPerPage: number
   page: number
   totalItems: number
   totalPages: number
}
