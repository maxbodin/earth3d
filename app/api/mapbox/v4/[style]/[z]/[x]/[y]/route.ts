import { NextRequest, NextResponse } from 'next/server'
import { isMapboxStyleUrl, parseMapboxStyleUrl, } from '@/app/constants/mapStyles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteParams = {
   style: string
   z: string
   x: string
   y: string
}

export async function GET(
   _request: NextRequest,
   { params }: { params: Promise<RouteParams> },
): Promise<NextResponse> {
   const token = process.env.SECRET_PUBLIC_MAPBOX_TOKEN

   if (!token) {
      return NextResponse.json(
         { error: 'Missing Mapbox token on server.' },
         { status: 500 },
      )
   }

   const { style, z, x, y } = await params
   const decodedStyle = decodeURIComponent(style)

   let mapboxUrl: string

   if (isMapboxStyleUrl(decodedStyle)) {
      const styleParts = parseMapboxStyleUrl(decodedStyle)

      if (!styleParts) {
         return NextResponse.json(
            { error: 'Invalid Mapbox style URL.' },
            { status: 400 },
         )
      }

      mapboxUrl = `https://api.mapbox.com/styles/v1/${styleParts.username}/${styleParts.styleId}/tiles/512/${z}/${x}/${y}@2x?access_token=${token}`
   } else {
      mapboxUrl = `https://api.mapbox.com/v4/${decodedStyle}/${z}/${x}/${y}@2x.jpg?access_token=${token}`
   }

   let mapboxResponse: Response

   try {
      mapboxResponse = await fetch(mapboxUrl, {
         cache: 'no-store',
      })
   } catch (error) {
      console.error('Mapbox tile proxy failed:', error)

      return NextResponse.json(
         { error: 'Unable to reach Mapbox tile service.' },
         { status: 502 },
      )
   }

   if (!mapboxResponse.ok) {
      return NextResponse.json(
         { error: `Mapbox tile fetch failed (${mapboxResponse.status}).` },
         { status: mapboxResponse.status },
      )
   }

   const contentType = mapboxResponse.headers.get('content-type') ?? 'image/jpeg'
   const tileData = await mapboxResponse.arrayBuffer()

   return new NextResponse(tileData, {
      status: 200,
      headers: {
         'Content-Type': contentType,
         'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
   })
}


