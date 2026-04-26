import { NextRequest, NextResponse } from 'next/server'
import { getCountryProfile } from '@/app/server/services/countryProfileService'
import { CountryProfileSeed } from '@/app/types/countryProfile'
import { parseQueryNumber } from '@/lib/parse/parseQueryNumber'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
   request: NextRequest,
   context: { params: Promise<{ alpha2: string }> },
): Promise<NextResponse> {
   try {
      const { alpha2 } = await context.params
      const normalizedAlpha2 = decodeURIComponent(alpha2).trim().toUpperCase()

      if (normalizedAlpha2.length === 0) {
         return NextResponse.json(
            { message: 'alpha2 route parameter is required.' },
            { status: 400 },
         )
      }

      const searchParams = request.nextUrl.searchParams
      const countryName = searchParams.get('name')?.trim() ?? normalizedAlpha2
      const alpha3 = searchParams.get('alpha3')?.trim().toUpperCase() ?? ''

      const seed: CountryProfileSeed = {
         countryName,
         alpha2: normalizedAlpha2,
         alpha3,
         numericCode: parseQueryNumber(searchParams.get('numeric')),
         latitude: parseQueryNumber(searchParams.get('lat')),
         longitude: parseQueryNumber(searchParams.get('lon')),
      }

      const countryProfile = await getCountryProfile(seed)

      return NextResponse.json(countryProfile, {
         status: 200,
         headers: {
            'Cache-Control': 'no-store',
         },
      })
   } catch {
      return NextResponse.json(
         { message: 'Unable to build country profile.' },
         { status: 500 },
      )
   }
}
