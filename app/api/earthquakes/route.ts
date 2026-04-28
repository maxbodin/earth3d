import { NextRequest, NextResponse } from 'next/server'
import { MAX_DISPLAYED_EARTHQUAKES } from '@/app/constants/numbers'
import { EarthquakeQueryParams } from '@/app/types/earthquake/earthquakeQueryParams'
import { UsgsEarthquakeResponse } from '@/app/types/earthquake/usgsEarthquakeResponse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const USGS_API_BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

const ALLOWED_PARAMS: ReadonlySet<string> = new Set([
   'starttime',
   'endtime',
   'minmagnitude',
   'maxmagnitude',
   'mindepth',
   'maxdepth',
   'limit',
   'orderby',
])

function buildUsgsUrl(params: EarthquakeQueryParams): string {
   const query = new URLSearchParams({ format: 'geojson' })

   for (const [key, value] of Object.entries(params)) {
      if (!ALLOWED_PARAMS.has(key) || value == null) continue
      const str = String(value)
      if (str.length === 0) continue
      query.set(key, str)
   }

   if (!query.has('limit')) {
      query.set('limit', String(MAX_DISPLAYED_EARTHQUAKES))
   }

   return `${USGS_API_BASE}?${query.toString()}`
}

function extractParams(searchParams: URLSearchParams): EarthquakeQueryParams {
   const params: EarthquakeQueryParams = {}

   const starttime = searchParams.get('starttime')
   if (starttime) params.starttime = starttime

   const endtime = searchParams.get('endtime')
   if (endtime) params.endtime = endtime

   const minmagnitude = searchParams.get('minmagnitude')
   if (minmagnitude) params.minmagnitude = Number(minmagnitude)

   const maxmagnitude = searchParams.get('maxmagnitude')
   if (maxmagnitude) params.maxmagnitude = Number(maxmagnitude)

   const mindepth = searchParams.get('mindepth')
   if (mindepth) params.mindepth = Number(mindepth)

   const maxdepth = searchParams.get('maxdepth')
   if (maxdepth) params.maxdepth = Number(maxdepth)

   const limit = searchParams.get('limit')
   if (limit) params.limit = Math.min(Number(limit), MAX_DISPLAYED_EARTHQUAKES)

   const orderby = searchParams.get('orderby')
   if (orderby === 'time' || orderby === 'time-asc' || orderby === 'magnitude' || orderby === 'magnitude-asc') {
      params.orderby = orderby
   }

   return params
}

export async function GET(request: NextRequest): Promise<NextResponse> {
   try {
      const params = extractParams(request.nextUrl.searchParams)
      const url = buildUsgsUrl(params)

      const response = await fetch(url, {
         next: { revalidate: 300 },
      })

      if (!response.ok) {
         return NextResponse.json(
            { message: `USGS API returned status ${response.status}.` },
            { status: response.status },
         )
      }

      const data = (await response.json()) as UsgsEarthquakeResponse

      return NextResponse.json(data, {
         status: 200,
         headers: {
            'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
         },
      })
   } catch (error) {
      console.error('Failed to fetch earthquake data:', error)

      return NextResponse.json(
         { message: 'Unable to fetch earthquake data from USGS.' },
         { status: 502 },
      )
   }
}
