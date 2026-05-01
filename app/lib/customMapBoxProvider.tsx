'use client'
import { MapProvider } from 'geo-three'
import { DEFAULT_MAP_STYLE_ID } from '@/app/constants/mapStyles'

/**
 * Map box service tile provider. Map tiles can be fetched from style or from a map id.
 *
 * API Reference
 *  - https://www.mapbox.com/
 */
export class CustomMapBoxProvider extends MapProvider {
   /**
    * Base address of the mapbox service.
    */
   public static ADDRESS: string = 'https://api.mapbox.com/'

   /**
    * Map image tile format, the formats available are:
    *  - png True color PNG
    *  - png32 32 color indexed PNG
    *  - png64 64 color indexed PNG
    *  - png128 128 color indexed PNG
    *  - png256 256 color indexed PNG
    *  - jpg70 70% quality JPG
    *  - jpg80 80% quality JPG
    *  - jpg90 90% quality JPG
    *  - pngraw Raw png (no interpolation)
    *
    * Map identifier composed of \{username\}.\{style\}
    */
   public mapStyle: string = DEFAULT_MAP_STYLE_ID

   public constructor() {
      super()
   }

   public fetchTile(
      zoom: number,
      x: number,
      y: number,
      signal?: AbortSignal,
   ): Promise<HTMLImageElement> {
      if (typeof window === 'undefined') {
         return Promise.reject(new Error('CustomMapBoxProvider requires a browser environment.'))
      }

      // Load tiles from same-origin API route to avoid browser CORS issues.
      return this.loadImage(
         `/api/mapbox/v4/${encodeURIComponent(this.mapStyle)}/${zoom}/${x}/${y}`,
         signal,
      )
   }
}
