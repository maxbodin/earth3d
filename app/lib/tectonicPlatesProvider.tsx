'use client'
import { MapProvider } from 'geo-three'

const TECTONIC_PLATES_MAX_ZOOM = 9

/**
 * Map provider for USGS tectonic plate boundary tiles.
 * Fetches tiles through the local API route proxy.
 */
export class TectonicPlatesProvider extends MapProvider {
   public constructor() {
      super()
      this.minZoom = 0
      this.maxZoom = TECTONIC_PLATES_MAX_ZOOM
   }

   public fetchTile(
      zoom: number,
      x: number,
      y: number,
      signal?: AbortSignal,
   ): Promise<HTMLImageElement> {
      if (typeof window === 'undefined') {
         return Promise.reject(
            new Error('TectonicPlatesProvider requires a browser environment.'),
         )
      }

      return this.loadImage(`/api/tectonic-plates/${zoom}/${x}/${y}`, signal, 'anonymous')
   }
}
