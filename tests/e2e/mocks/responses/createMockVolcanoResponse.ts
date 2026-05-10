import { VolcanoResponse } from '@/app/types/volcano/volcanoResponse'

export function createMockVolcanoResponse(volcanoCount: number = 3, eruptionsPerVolcano: number = 2): VolcanoResponse {
   const volcanoes = Array.from({ length: volcanoCount }, (_, i) => ({
      id: i + 1,
      name: `TestVolcano ${i}`,
      country: ['Japan', 'Indonesia', 'Italy', 'USA', 'Chile'][i % 5],
      region: `Region ${i}`,
      type: ['Stratovolcano', 'Shield', 'Caldera'][i % 3],
      latitude: 35 + i * 5,
      longitude: 130 + i * 10,
      elevationMeters: 1000 + i * 500,
      lastEruptionYear: 2000 + i,
      eruptionCount: eruptionsPerVolcano,
   }))

   const eruptions = volcanoes.flatMap((v, vi) =>
      Array.from({ length: eruptionsPerVolcano }, (_, ei) => ({
         agent: null,
         country: v.country,
         damageAmountOrder: null,
         damageAmountOrderTotal: null,
         day: 15,
         deaths: ei === 0 ? 100 * (vi + 1) : null,
         deathsAmountOrder: null,
         deathsAmountOrderTotal: null,
         deathsTotal: null,
         earthquakeEventId: null,
         elevation: v.elevationMeters,
         eruption: true,
         id: vi * eruptionsPerVolcano + ei + 1,
         injuries: null,
         injuriesAmountOrder: null,
         injuriesAmountOrderTotal: null,
         injuriesTotal: null,
         latitude: v.latitude,
         location: v.region,
         longitude: v.longitude,
         month: 6,
         morphology: v.type,
         name: v.name,
         publish: true,
         significant: ei === 0,
         status: 'Historical',
         timeErupt: null,
         tsunamiEventId: null,
         vei: 2 + ei,
         volcanoLocationId: v.id,
         volcanoLocationNewNum: null,
         volcanoLocationNum: null,
         year: 2000 + vi - ei,
      })),
   )

   return {
      eruptions,
      items: volcanoes,
      totalCount: volcanoes.length,
   }
}
