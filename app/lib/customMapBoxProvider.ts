// @ts-ignore
import { MapBoxProvider, MapProvider } from 'geo-three'
import { getMapboxToken } from '@/app/server/actions/getMapboxToken'

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
   public static ADDRESS: string = 'https://api.mapbox.com/v4/mapbox.satellite/'

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
    */

   /**
    * Map identifier composed of \{username\}.\{style\}
    */
   public mapStyle: string = 'mapbox.satellite'

   //private isHeight: boolean

   private publicToken: string = ''

   /**
    * @param isHeight - Provider is used for height map.
    */
   public constructor(isHeight: boolean) {
      super()
      //this.isHeight = isHeight
   }

   public async savePublicToken(): Promise<void> {
      this.publicToken = await getMapboxToken()
      if (this.publicToken == null) {
         console.error('MISSING MAPBOX PUBLIC TOKEN.')
         return
      }
   }

   public fetchTile(zoom: number, x: number, y: number): Promise<any> {
      return new Promise(async (resolve, reject): Promise<any> => {
         this.savePublicToken().then((): void => {
            const image = window.document.createElement('img')
            image.onload = function (): void {
               resolve(image)
            }
            image.onerror = function (): void {
               reject()
            }
            image.crossOrigin = 'Anonymous'
            image.src = `${MapBoxProvider.ADDRESS}v4/${this.mapStyle}/${zoom}/${x}/${y}@2x.jpg?access_token=${this.publicToken}`
         })
      })
   }
}
