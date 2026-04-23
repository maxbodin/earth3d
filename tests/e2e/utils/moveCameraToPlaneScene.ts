import { PLANE_SCENE_TYPE } from '@/app/constants/numbers'
import { Page } from '@playwright/test'
import { readSceneDebug } from '@/tests/e2e/utils/readSceneDebug'

export const moveCameraToPlaneScene = async (page: Page): Promise<void> => {
   const viewport = page.viewportSize() ?? { width: 1280, height: 720 }
   const centerX = Math.floor(viewport.width / 2)
   const centerY = Math.floor(viewport.height / 2)

   await page.mouse.move(centerX, centerY)

   const tryZoomDirection = async (wheelDeltaY: number): Promise<boolean> => {
      for (let attempt = 0; attempt < 50; attempt++) {
         await page.mouse.wheel(0, wheelDeltaY)
         await page.waitForTimeout(30)

         const debug = await readSceneDebug(page)
         if (debug.planesSceneType === PLANE_SCENE_TYPE) {
            return true
         }
      }

      return false
   }

   if (await tryZoomDirection(-1600)) {
      return
   }

   if (await tryZoomDirection(1600)) {
      return
   }

   throw new Error('Unable to switch to plane scene from test camera controls.')
}