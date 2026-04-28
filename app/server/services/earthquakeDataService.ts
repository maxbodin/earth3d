import { EARTHQUAKE_API_PATH } from '@/app/constants/strings'
import { EarthquakeQueryParams } from '@/app/types/earthquake/earthquakeQueryParams'
import { UsgsEarthquakeResponse } from '@/app/types/earthquake/usgsEarthquakeResponse'

function buildEarthquakeApiUrl(params: EarthquakeQueryParams): string {
   const query = new URLSearchParams()

   if (params.starttime) query.set('starttime', params.starttime)
   if (params.endtime) query.set('endtime', params.endtime)
   if (params.minmagnitude != null) query.set('minmagnitude', String(params.minmagnitude))
   if (params.maxmagnitude != null) query.set('maxmagnitude', String(params.maxmagnitude))
   if (params.mindepth != null) query.set('mindepth', String(params.mindepth))
   if (params.maxdepth != null) query.set('maxdepth', String(params.maxdepth))
   if (params.limit != null) query.set('limit', String(params.limit))
   if (params.orderby) query.set('orderby', params.orderby)

   return `${EARTHQUAKE_API_PATH}?${query.toString()}`
}

export async function fetchEarthquakeData(
   params: EarthquakeQueryParams,
): Promise<UsgsEarthquakeResponse> {
   const response = await fetch(buildEarthquakeApiUrl(params), {
      cache: 'no-store',
   })

   if (!response.ok) {
      throw new Error(`fetchEarthquakeData: Request failed with status ${response.status}.`)
   }

   return (await response.json()) as UsgsEarthquakeResponse
}
