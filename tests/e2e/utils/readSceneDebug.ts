import { Page } from '@playwright/test'
import { ThreeSceneDebugSnapshot } from '@/tests/e2e/types/threeSceneDebugSnapshot'

export const readSceneDebug = async (page: Page): Promise<ThreeSceneDebugSnapshot> => {
   return page.evaluate(() => {
      return (window as Window & {
         __THREE_SCENE_DEBUG__?: ThreeSceneDebugSnapshot
      }).__THREE_SCENE_DEBUG__ ?? {}
   })
}