import { VOLCANO_API_PATH } from '@/app/constants/strings'
import { VolcanoResponse } from '@/app/types/volcano/volcanoResponse'

export async function fetchVolcanoData(): Promise<VolcanoResponse> {
   const response = await fetch(VOLCANO_API_PATH, {
      cache: 'no-store',
   })

   if (!response.ok) {
      throw new Error(`fetchVolcanoData: Request failed with status ${response.status}.`)
   }

   return (await response.json()) as VolcanoResponse
}
