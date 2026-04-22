import { NextRequest, NextResponse } from 'next/server'
import { getOpenSkyStates } from '@/app/server/services/openSkyService'
import { parseBBox } from '@/lib/parse/parseBBox'
import { PlaneStatesApiResponse } from '@/app/types/plane/planeStatesApiResponse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
   try {
      const searchParams = request.nextUrl.searchParams
      const bbox = parseBBox(searchParams)
      const extended = searchParams.get('extended') !== '0'

      const {
         response,
         source,
         fetchedAt,
         ttlMs,
         retryAfterSeconds,
         authenticated,
         requestCost,
         normalizedBBox,
      } = await getOpenSkyStates({
         bbox,
         extended,
      })

      const payload: PlaneStatesApiResponse = {
         time: response.time,
         states: response.states ?? [],
         meta: {
            source,
            fetchedAt,
            ttlMs,
            retryAfterSeconds,
            authenticated,
            requestCost,
            normalizedBBox,
         },
      }

      return NextResponse.json(payload, {
         status: 200,
         headers: {
            'Cache-Control': 'public, max-age=10, s-maxage=10, stale-while-revalidate=20',
         },
      })
   } catch (error) {
      console.error('Failed to fetch OpenSky states:', error)

      return NextResponse.json(
         {
            message: 'Unable to fetch planes states from OpenSky.',
         },
         {
            status: 502,
         },
      )
   }
}
