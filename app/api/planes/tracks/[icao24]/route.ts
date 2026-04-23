import { NextRequest, NextResponse } from 'next/server'
import { getOpenSkyTrack } from '@/app/server/services/openSkyService'
import { parseTrackTime } from '@/lib/parse/parseTrackTime'
import { PlaneTrackApiResponse } from '@/app/types/plane/planeTrackApiResponse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
   request: NextRequest,
   context: { params: Promise<{ icao24: string }> },
): Promise<NextResponse> {
   try {
      const { icao24 } = await context.params
      const normalizedIcao24 = decodeURIComponent(icao24).trim().toLowerCase()

      if (normalizedIcao24.length === 0) {
         return NextResponse.json(
            { message: 'icao24 route parameter is required.' },
            { status: 400 },
         )
      }

      const time = parseTrackTime(request.nextUrl.searchParams)

      const {
         track,
         source,
         fetchedAt,
         ttlMs,
         retryAfterSeconds,
         authenticated,
      } = await getOpenSkyTrack({
         icao24: normalizedIcao24,
         time,
      })

      const payload: PlaneTrackApiResponse = {
         track,
         meta: {
            source,
            fetchedAt,
            ttlMs,
            retryAfterSeconds,
            authenticated,
         },
      }

      return NextResponse.json(payload, {
         status: 200,
         headers: {
            'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=120',
         },
      })
   } catch (error) {
      console.error('Failed to fetch OpenSky track:', error)

      return NextResponse.json(
         {
            message: 'Unable to fetch plane track from OpenSky.',
         },
         {
            status: 502,
         },
      )
   }
}
