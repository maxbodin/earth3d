export type ThreeSceneDebugSnapshot = {
   circleDiameterLabelTexts?: string[]
   circleMarkerLinePointCounts?: number[]
   circleMarkerMinRadiusKm?: number | null
   circleMarkerSceneType?: number | null
   circleMarkersCount?: number
   countryFrontiersCount?: number
   countryNamesCount?: number
   countryNamesMinDistanceFromCenter?: number | null
   countryNamesMinVisualSize?: number | null
   displayedPlanesCount?: number
   displayedPlanesMinAltitudeMeters?: number | null
   markerObjectsCount?: number
   markerTitleMinClearanceFromMarkerTop?: number | null
   markerTitleMinVisualSize?: number | null
   markerTitleScaleDamping?: number | null
   markerTitleSceneType?: number | null
   markerTitleTexts?: string[]
   markerTitlesCount?: number
   planesSceneType?: number | null
   selectedCountryFrontiersCount?: number
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
