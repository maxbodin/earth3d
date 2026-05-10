import { useRef } from 'react'
import { SceneLodScaler } from '@/app/lib/sceneLodScaler'
import { SceneLodConfig } from '@/app/lib/sceneLod'

interface UseSceneLodScalerOptions {
   config: SceneLodConfig
   damped?: boolean
   distanceThreshold?: number
   onScaleChange: (scale: number, distance: number) => void
   scaleThreshold?: number
}

/**
 * Creates a stable `SceneLodScaler` instance that persists across renders.
 * The `onScaleChange` callback is always invoked with the latest closure
 * by routing through a ref. (Singleton)
 */
export function useSceneLodScaler(options: UseSceneLodScalerOptions): SceneLodScaler {
   const callbackRef = useRef(options.onScaleChange)
   callbackRef.current = options.onScaleChange

   const scalerRef = useRef<SceneLodScaler | null>(null)

   if (scalerRef.current == null) {
      scalerRef.current = new SceneLodScaler({
         config: options.config,
         damped: options.damped,
         distanceThreshold: options.distanceThreshold,
         scaleThreshold: options.scaleThreshold,
         onScaleChange: (scale, distance) => callbackRef.current(scale, distance),
      })
   }

   return scalerRef.current
}
