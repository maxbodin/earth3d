import { SceneType } from '@/app/enums/sceneType'
import { computeDampedScale, computeSceneLodScale, SceneLodConfig } from '@/app/lib/sceneLod'

interface SceneLodScalerOptions {
   config: SceneLodConfig
   damped?: boolean
   distanceThreshold?: number
   onScaleChange: (scale: number, distance: number) => void
   scaleThreshold?: number
}

/**
 * Encapsulates distance-based LOD scale tracking, threshold detection,
 * and controls listener lifecycle. Use via `useSceneLodScaler` hook.
 */
export class SceneLodScaler {
   private readonly config: SceneLodConfig
   private readonly damped: boolean
   private readonly distanceThreshold: number
   private readonly onScaleChange: (scale: number, distance: number) => void
   private readonly scaleThreshold: number

   private boundHandler: (() => void) | null = null
   private controls: { addEventListener: (type: string, listener: () => void) => void; removeEventListener: (type: string, listener: () => void) => void; getDistance: () => number } | null = null
   private lastDistance = 0
   private scale = 0
   private sceneType: SceneType = SceneType.SPHERICAL

   constructor(options: SceneLodScalerOptions) {
      this.config = options.config
      this.damped = options.damped ?? false
      this.distanceThreshold = options.distanceThreshold ?? 0
      this.scaleThreshold = options.scaleThreshold ?? 0
      this.onScaleChange = options.onScaleChange
   }

   get currentScale(): number {
      return this.scale
   }

   computeScale(sceneType: SceneType, distance: number): number {
      return this.damped
         ? computeDampedScale(sceneType, distance, this.config)
         : computeSceneLodScale(sceneType, distance, this.config)
   }

   /**
    * Compute and store the initial scale. Returns the computed value.
    */
   initialize(sceneType: SceneType, distance: number): number {
      this.sceneType = sceneType
      this.lastDistance = distance
      this.scale = this.computeScale(sceneType, distance)
      return this.scale
   }

   /**
    * Evaluate whether a distance change warrants a scale update.
    * If so, computes the new scale and invokes the callback.
    * Returns the current scale.
    */
   update(distance: number): number {
      const distanceChange = Math.abs(distance - this.lastDistance)

      if (distanceChange < this.distanceThreshold) {
         const newScale = this.computeScale(this.sceneType, distance)
         if (Math.abs(newScale - this.scale) < this.scaleThreshold) return this.scale
         this.scale = newScale
         this.onScaleChange(newScale, distance)
         return newScale
      }

      this.lastDistance = distance
      const newScale = this.computeScale(this.sceneType, distance)

      if (Math.abs(newScale - this.scale) >= this.scaleThreshold) {
         this.scale = newScale
         this.onScaleChange(newScale, distance)
      }

      return newScale
   }

   /**
    * Attach to OrbitControls, listens for 'change' events and auto-updates.
    */
   attach(
      controls: { addEventListener: (type: string, listener: () => void) => void; removeEventListener: (type: string, listener: () => void) => void; getDistance: () => number },
      sceneType: SceneType,
   ): void {
      this.detach()
      this.controls = controls
      this.sceneType = sceneType

      this.boundHandler = (): void => {
         this.update(controls.getDistance())
      }

      controls.addEventListener('change', this.boundHandler)
   }

   /**
    * Detach from controls, removes the 'change' listener.
    */
   detach(): void {
      if (this.controls != null && this.boundHandler != null) {
         this.controls.removeEventListener('change', this.boundHandler)
      }
      this.controls = null
      this.boundHandler = null
   }
}
