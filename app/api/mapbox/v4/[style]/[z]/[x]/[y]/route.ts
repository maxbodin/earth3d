import { NextRequest, NextResponse } from 'next/server'

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
   { params }: { params: RouteParams },
): Promise<NextResponse> {
   const token = process.env.SECRET_PUBLIC_MAPBOX_TOKEN

   if (!token) {
      return NextResponse.json(
         { error: 'Missing Mapbox token on server.' },
         { status: 500 },
      )
   }

   const { style, z, x, y } = params
   const mapboxUrl = `https://api.mapbox.com/v4/${style}/${z}/${x}/${y}@2x.jpg?access_token=${token}`

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


