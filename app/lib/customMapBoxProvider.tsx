'use client'
// @ts-ignore
import { MapProvider } from 'geo-three'

/**
 * Map box service tile provider. Map tiles can be fetched from style or from a map id.
 *
 * API Reference
 *  - https://www.mapbox.com/
 */
export class CustomMapBoxProvider extends MapProvider {
   /**
    * Base adress of the mapbox service.
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
   public mapStyle: string = 'mapbox.satellite'

   public publicToken: string = ''

   public constructor() {
      super()
   }

   public fetchTile(zoom: number, x: number, y: number): Promise<any> {
      return new Promise(async (resolve, reject): Promise<any> => {
         if (typeof window !== 'undefined') {
            const image: HTMLImageElement = window.document.createElement('img')
            image.onload = function(): void {
               resolve(image)
            }
            image.onerror = function(): void {
               reject()
            }
            image.crossOrigin = 'Anonymous'
            image.src = `${CustomMapBoxProvider.ADDRESS}v4/${this.mapStyle}/${zoom}/${x}/${y}@2x.jpg?access_token=${this.publicToken}`
         }
      })
   }
}
