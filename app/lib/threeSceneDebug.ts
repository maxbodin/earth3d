type ThreeSceneDebugSnapshot = {
   markerObjectsCount?: number
   markerTitlesCount?: number
   markerTitleTexts?: string[]
   markerTitleMinVisualSize?: number | null
   markerTitleMinClearanceFromMarkerTop?: number | null
   markerTitleSceneType?: number | null
   markerTitleScaleDamping?: number | null
   countryNamesCount?: number
   countryNamesMinDistanceFromCenter?: number | null
   countryNamesMinVisualSize?: number | null
}

declare global {
   interface Window {
      __THREE_SCENE_DEBUG__?: ThreeSceneDebugSnapshot
   }
}

export function publishThreeSceneDebug(snapshot: Partial<ThreeSceneDebugSnapshot>): void {
   if (typeof window === 'undefined') return

   window.__THREE_SCENE_DEBUG__ = {
      ...(window.__THREE_SCENE_DEBUG__ ?? {}),
      ...snapshot,
   }
}
