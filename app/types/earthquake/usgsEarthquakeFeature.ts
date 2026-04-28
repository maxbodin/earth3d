export interface UsgsEarthquakeFeature {
   type: 'Feature'
   properties: {
      mag: number | null
      place: string | null
      time: number
      updated: number
      tz: number | null
      url: string
      detail: string
      felt: number | null
      cdi: number | null
      mmi: number | null
      alert: string | null
      status: string
      tsunami: number
      sig: number
      net: string
      code: string
      ids: string
      sources: string
      types: string
      nst: number | null
      dmin: number | null
      rms: number | null
      gap: number | null
      magType: string | null
      type: string
      title: string
   }
   geometry: {
      type: 'Point'
      coordinates: [longitude: number, latitude: number, depth: number]
   }
   id: string
}