import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const USGS_TILE_BASE = 'https://earthquake.usgs.gov/basemap/tiles/plates'
const MAX_ZOOM = 9

type RouteParams = {
   z: string
   x: string
   y: string
}

export async function GET(
   _request: NextRequest,
   { params }: { params: Promise<RouteParams> },
): Promise<NextResponse> {
   const { z, x, y } = await params

   const zoom = Number(z)
   if (!Number.isInteger(zoom) || zoom < 0 || zoom > MAX_ZOOM) {
      return NextResponse.json(
         { error: `Invalid zoom level. Must be 0-${MAX_ZOOM}.` },
         { status: 400 },
      )
   }

   const tileX = Number(x)
   const tileY = Number(y)
   const maxTile = Math.pow(2, zoom) - 1

   if (!Number.isInteger(tileX) || tileX < 0 || tileX > maxTile) {
      return NextResponse.json(
         { error: 'Invalid x coordinate.' },
         { status: 400 },
      )
   }

   if (!Number.isInteger(tileY) || tileY < 0 || tileY > maxTile) {
      return NextResponse.json(
         { error: 'Invalid y coordinate.' },
         { status: 400 },
      )
   }

   const tileUrl = `${USGS_TILE_BASE}/${z}/${x}/${y}.png`

   let tileResponse: Response

   try {
      tileResponse = await fetch(tileUrl, { cache: 'force-cache' })
   } catch (error) {
      console.error('Tectonic plates tile proxy failed:', error)

      return NextResponse.json(
         { error: 'Unable to reach USGS tile service.' },
         { status: 502 },
      )
   }

   if (!tileResponse.ok) {
      return NextResponse.json(
         { error: `USGS tile fetch failed (${tileResponse.status}).` },
         { status: tileResponse.status },
      )
   }

   const tileData = await tileResponse.arrayBuffer()

   return new NextResponse(tileData, {
      status: 200,
      headers: {
         'Content-Type': 'image/png',
         'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
      },
   })
}
