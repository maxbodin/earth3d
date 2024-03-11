import * as THREE from 'three'

export class MeshLine extends THREE.BufferGeometry {
   isMeshLine: boolean
   type: string
   positions: Array<number>
   previous: Array<number>
   next: Array<number>
   side: Array<number>
   width: Array<number>
   indices_array: Array<number>
   uvs: Array<number>
   counters: Array<number>
   _points: Array<number>
   _geom: any
   widthCallback: any
   matrixWorld: THREE.Matrix4
   geometry: MeshLine
   points: Float32Array | Array<number>

   constructor()

   setMatrixWorld(matrixWorld: THREE.Matrix4): void

   setGeometry(g: THREE.BufferGeometry, c: (p: number) => any): void

   setPoints(
      points: Float32Array | Array<number>,
      wcb?: (p: number) => any
   ): void

   raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]): void

   compareV3(a: number, b: number): boolean

   copyV3(a: number): Array<number>

   process(): void

   advance(position: THREE.Vector3): void
}

export class MeshLineMaterial extends THREE.ShaderMaterial {
   isMeshLineMaterial: boolean
   type: string
   lineWidth: number
   map: THREE.Texture
   useMap: number
   alphaMap: THREE.Texture
   useAlphaMap: number
   color: THREE.Color | string | number
   opacity: number
   resolution: THREE.Vector2
   sizeAttenuation: number
   dashArray: number
   dashOffset: number
   dashRatio: number
   useDash: number
   visibility: number
   alphaTest: number
   repeat: THREE.Vector2

   constructor(parametes?: {
      isMeshLineMaterial?: boolean
      type?: string
      lineWidth?: number
      map?: THREE.Texture
      useMap?: number
      alphaMap?: THREE.Texture
      useAlphaMap?: number
      color?: string | THREE.Color | number
      opacity?: number
      resolution: THREE.Vector2 // required
      sizeAttenuation?: number
      dashArray?: number
      dashOffset?: number
      dashRatio?: number
      useDash?: number
      visibility?: number
      alphaTest?: number
      repeat?: THREE.Vector2
   })

   copy(source: MeshLineMaterial): MeshLineMaterial
}

export function MeshLineRaycast(
   raycaster: THREE.Raycaster,
   intersects: THREE.Intersection[]
): void
