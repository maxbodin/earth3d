import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { EARTH_SCENE_TEXT_BASE_DEPTH, EARTH_SCENE_TEXT_BASE_SIZE } from '@/lib/three/getObjectGeometryExtentFromOrigin'

export const DEFAULT_TEXT_CURVE_SEGMENTS = 4

type TextGeometryOptions = {
   text: string
   font: Font
   size: number
   depth: number
   curveSegments?: number
   bevelEnabled?: boolean
   bevelThickness?: number
   bevelSize?: number
   bevelOffset?: number
   bevelSegments?: number
}

/**
 *
 * @param options
 */
export function createTextGeometry(
   options: TextGeometryOptions,
): TextGeometry {
   const geometry = new TextGeometry(options.text, {
      font: options.font,
      size: options.size ?? EARTH_SCENE_TEXT_BASE_SIZE,
      depth: options.depth ?? EARTH_SCENE_TEXT_BASE_DEPTH,
      curveSegments: options.curveSegments ?? DEFAULT_TEXT_CURVE_SEGMENTS,
      bevelEnabled: options.bevelEnabled ?? false,
      bevelThickness: options.bevelThickness,
      bevelSize: options.bevelSize,
      bevelOffset: options.bevelOffset,
      bevelSegments: options.bevelSegments,
   })

   geometry.computeBoundingSphere()
   geometry.computeBoundingBox()
   geometry.center()

   return geometry
}