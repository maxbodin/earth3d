import { SceneType } from '@/app/enums/sceneType'

/**
 * Returns `true` when the scene type supports earth-surface rendering.
 * @param sceneType
 */
export function isEarthScene(sceneType: SceneType): boolean {
   return sceneType === SceneType.SPHERICAL || sceneType === SceneType.PLANE
}