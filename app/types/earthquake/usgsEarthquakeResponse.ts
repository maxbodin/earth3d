import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'

export interface UsgsEarthquakeResponse {
   type: 'FeatureCollection'
   metadata: {
      generated: number
      url: string
      title: string
      status: number
      api: string
      count: number
   }
   features: UsgsEarthquakeFeature[]
}