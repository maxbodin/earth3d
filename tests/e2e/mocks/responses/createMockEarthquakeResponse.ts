import { ONE_HOUR_IN_MS } from '@/app/constants/numbers'

export function createMockEarthquakeResponse(count: number = 3) {
   const features = Array.from({ length: count }, (_, i) => ({
      type: 'Feature',
      properties: {
         mag: 3.5 + i,
         place: `${50 + i}km NW of TestCity ${i}`,
         time: Date.now() - i * ONE_HOUR_IN_MS,
         updated: Date.now(),
         tz: null,
         url: `https://earthquake.usgs.gov/earthquakes/eventpage/test${i}`,
         detail: '',
         felt: i > 0 ? 10 + i : null,
         cdi: null,
         mmi: null,
         alert: null,
         status: 'reviewed',
         tsunami: 0,
         sig: 200 + i * 50,
         net: 'us',
         code: `test${i}`,
         ids: `,ustest${i},`,
         sources: ',us,',
         types: ',origin,',
         nst: null,
         dmin: null,
         rms: null,
         gap: null,
         magType: 'mb',
         type: 'earthquake',
         title: `M ${3.5 + i} - ${50 + i}km NW of TestCity ${i}`,
      },
      geometry: {
         type: 'Point',
         coordinates: [-120 + i * 10, 35 + i * 5, 10 + i * 20],
      },
      id: `test${i}`,
   }))

   return {
      type: 'FeatureCollection',
      metadata: {
         generated: Date.now(),
         url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
         title: 'USGS Earthquakes',
         status: 200,
         api: '1.14.1',
         count,
      },
      features,
   }
}