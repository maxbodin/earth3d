export interface Eruption {
   agent: string | null
   country: string
   damageAmountOrder: number | null
   damageAmountOrderTotal: number | null
   day: number | null
   deaths: number | null
   deathsAmountOrder: number | null
   deathsAmountOrderTotal: number | null
   deathsTotal: number | null
   earthquakeEventId: number | null
   elevation: number | null
   eruption: boolean | null
   id: number
   injuries: number | null
   injuriesAmountOrder: number | null
   injuriesAmountOrderTotal: number | null
   injuriesTotal: number | null
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
   tsunamiEventId: number | null
   vei: number | null
   volcanoLocationId: number
   volcanoLocationNewNum: number | null
   volcanoLocationNum: string | null
   year: number | null
}