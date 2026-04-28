import { SceneType } from '@/app/enums/sceneType'
import { getCurrentUrl, replaceCurrentUrl } from '@/app/lib/searchParamsHelper'

export const MODE_SEARCH_PARAM_KEY = 'mode'
export const MODE_SEARCH_PARAMS_UPDATED_EVENT = 'mode-search-params-updated'

const SCENE_TYPE_TO_MODE: Record<SceneType, string> = {
   [SceneType.PLANE]: 'planisphere',
   [SceneType.SPHERICAL]: 'sphere',
   [SceneType.SOLAR_SYSTEM]: 'solar_system',
}

const MODE_TO_SCENE_TYPE: Record<string, SceneType> = {
   planisphere: SceneType.PLANE,
   sphere: SceneType.SPHERICAL,
   solar_system: SceneType.SOLAR_SYSTEM,
}

export function sceneTypeToMode(sceneType: SceneType): string {
   return SCENE_TYPE_TO_MODE[sceneType]
}

export function modeToSceneType(mode: string): SceneType | null {
   return MODE_TO_SCENE_TYPE[mode] ?? null
}

export function readModeFromSearchParams(
   searchParams: URLSearchParams,
): SceneType | null {
   const mode = searchParams.get(MODE_SEARCH_PARAM_KEY)
   if (mode == null) return null
   return modeToSceneType(mode)
}

export function readModeFromCurrentUrl(): SceneType | null {
   const currentUrl = getCurrentUrl()
   if (currentUrl == null) return null

   return readModeFromSearchParams(currentUrl.searchParams)
}

export function updateModeInCurrentUrl(sceneType: SceneType): void {
   const currentUrl = getCurrentUrl()
   if (currentUrl == null) return

   const mode = sceneTypeToMode(sceneType)
   const currentMode = currentUrl.searchParams.get(MODE_SEARCH_PARAM_KEY)

   if (currentMode === mode) return

   currentUrl.searchParams.set(MODE_SEARCH_PARAM_KEY, mode)

   replaceCurrentUrl(currentUrl, MODE_SEARCH_PARAMS_UPDATED_EVENT, sceneType)
}
