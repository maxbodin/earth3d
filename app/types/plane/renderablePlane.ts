import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { Vector3 } from 'three'

export type RenderablePlane = {
   state: OpenSkyStateVector
   position: Vector3
   headingRad: number | null
}