import { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { AssetManager } from '@/app/lib/assetManager'
import { TEXT_FONT } from '@/app/constants/paths'

let sharedEarthSceneTextFont: Font | null = null
let sharedEarthSceneTextFontPromise: Promise<Font> | null = null

/**
 * Loads the shared 3D text font, caching the result for subsequent calls.
 *
 * @returns A promise resolving to the loaded `Font` instance.
 */
export async function loadSharedTextFont(): Promise<Font> {
   if (sharedEarthSceneTextFont != null) return sharedEarthSceneTextFont
   if (sharedEarthSceneTextFontPromise != null) return sharedEarthSceneTextFontPromise

   sharedEarthSceneTextFontPromise = AssetManager.loadFont(TEXT_FONT)
      .then((loadedFont): Font => {
         sharedEarthSceneTextFont = loadedFont
         return loadedFont
      })

   return sharedEarthSceneTextFontPromise
}