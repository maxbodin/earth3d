import { SceneType } from '@/app/enums/sceneType'
import { PerspectiveCamera, Scene } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Scene Data Type.
 */
export interface SceneData {
   type: SceneType,
   camera: PerspectiveCamera,
   controls: OrbitControls,
   scene: Scene,
}