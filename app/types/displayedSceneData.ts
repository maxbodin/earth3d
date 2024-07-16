import { SceneType } from '@/app/enums/sceneType'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'

/**
 * Displayed scene data.
 */
export interface DisplayedSceneData {
   type: SceneType
   camera: THREE.PerspectiveCamera
   controls: OrbitControls
   scene: THREE.Scene
}