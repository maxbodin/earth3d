import { NextResponse } from 'next/server'
import { Volcano } from '@/app/types/volcano/volcano'
import { VolcanoResponse } from '@/app/types/volcano/volcanoResponse'
import { NoaaVolcanoEruption, NoaaVolcanoResponse } from '@/app/types/volcano/noaaVolcanoEruption'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const NOAA_API_BASE = 'https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/volcanoes'
const MAX_ROWS = 1000

async function fetchAllEruptions(): Promise<NoaaVolcanoEruption[]> {
   const firstPage = await fetch(`${NOAA_API_BASE}?maxRows=${MAX_ROWS}&page=1`, {
      next: { revalidate: 86_400 },
   })

   if (!firstPage.ok) {
      throw new Error(`NOAA API returned status ${firstPage.status}.`)
   }

   const firstData = (await firstPage.json()) as NoaaVolcanoResponse
   const allItems: NoaaVolcanoEruption[] = [...firstData.items]

   const fetches: Promise<Response>[] = []
   for (let page = 2; page <= firstData.totalPages; page++) {
      fetches.push(
         fetch(`${NOAA_API_BASE}?maxRows=${MAX_ROWS}&page=${page}`, {
            next: { revalidate: 86_400 },
         }),
      )
   }

   const responses = await Promise.all(fetches)

   for (const response of responses) {
      if (!response.ok) continue
      const data = (await response.json()) as NoaaVolcanoResponse
      allItems.push(...data.items)
   }

   return allItems
}

function deduplicateVolcanoes(eruptions: NoaaVolcanoEruption[]): Volcano[] {
   const volcanoMap = new Map<number, { volcano: Volcano; latestYear: number }>()

   for (const eruption of eruptions) {
      const existing = volcanoMap.get(eruption.volcanoLocationId)
      const year = eruption.year ?? -Infinity

      if (existing == null) {
         volcanoMap.set(eruption.volcanoLocationId, {
            volcano: {
               id: eruption.volcanoLocationId,
               name: eruption.name,
               country: eruption.country,
               region: eruption.location,
               type: eruption.morphology,
               latitude: eruption.latitude,
               longitude: eruption.longitude,
               elevationMeters: eruption.elevation,
               lastEruptionYear: eruption.year,
               eruptionCount: 1,
            },
            latestYear: year,
         })
      } else {
         existing.volcano.eruptionCount++
         if (year > existing.latestYear) {
            existing.latestYear = year
            existing.volcano.lastEruptionYear = eruption.year
         }
      }
   }

   return Array.from(volcanoMap.values()).map(entry => entry.volcano)
}

export async function GET(): Promise<NextResponse> {
   try {
      const eruptions = await fetchAllEruptions()
      const volcanoes = deduplicateVolcanoes(eruptions)

      const response: VolcanoResponse = {
         items: volcanoes,
         totalCount: volcanoes.length,
      }

      return NextResponse.json(response, {
         status: 200,
         headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=172800',
         },
      })
   } catch (error) {
      console.error('Failed to fetch volcano data:', error)

      return NextResponse.json(
         { message: 'Unable to fetch volcano data from NOAA.' },
         { status: 502 },
      )
   }
}
