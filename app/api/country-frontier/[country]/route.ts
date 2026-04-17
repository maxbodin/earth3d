import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function formatCountryName(countryName: string): string {
   return countryName
      .replace(/ /g, '_')
      .replace(/\./g, '')
      .replace(/&/g, 'and')
      .toLowerCase()
}

function resolveCountryGeoJsonPath(countryName: string): string {
   const formattedCountryName = formatCountryName(countryName)

   return path.join(
      process.cwd(),
      'node_modules',
      'world-geojson',
      'countries',
      `${formattedCountryName}.json`,
   )
}

export async function GET(
   request: Request,
   context: { params: Promise<{ country: string }> },
): Promise<NextResponse> {
   try {
      const { country } = await context.params
      const decodedCountry = decodeURIComponent(country).trim()

      if (decodedCountry.length === 0) {
         return NextResponse.json(
            { message: 'Country parameter is required.' },
            { status: 400 },
         )
      }

      const filePath = resolveCountryGeoJsonPath(decodedCountry)
      const fileContent = await readFile(filePath, 'utf8')
      const geoJson = JSON.parse(fileContent)

      return NextResponse.json(geoJson)
   } catch {
      return NextResponse.json(
         { message: 'Country frontier not found.' },
         { status: 404 },
      )
   }
}
