import { expect, test } from '@playwright/test'
import * as THREE from 'three'
import { LODRadial } from '../../../geo-three/source/lod/LODRadial'
import { MapNode, QuadTreePosition } from '../../../geo-three/source/nodes/MapNode'

test.describe('Geo-Three radial LOD', () => {
   test('subdivides planar tiles when the camera is above the tile footprint but far from its center', () => {
      const lod = new LODRadial(150000, 1200000)
      const camera = new THREE.PerspectiveCamera()
      camera.position.set(12000000, 1000000, 0)
      camera.updateMatrixWorld(true)

      const root = new THREE.Object3D() as THREE.Object3D & {
         level: number
         parentNode: null
         subdivideCalls: number
         subdivide: () => void
         simplify: () => void
      }
      root.level = 0
      root.parentNode = null
      root.subdivideCalls = 0
      root.subdivide = () => {
         root.subdivideCalls += 1
      }
      root.simplify = () => undefined
      root.scale.set(40000000, 1, 40000000)
      root.updateMatrixWorld(true)

      lod.updateLOD(
         { children: [root], provider: { maxZoom: 6 } } as any,
         camera,
         {} as THREE.WebGLRenderer,
         new THREE.Scene(),
      )

      expect(root.subdivideCalls).toBe(1)
   })

   test('restores cached children as visible after they finish loading while simplified', () => {
      class TestNode extends MapNode {
         public constructor(parentNode: MapNode | undefined, mapView: any, location = QuadTreePosition.root, level = 0, x = 0, y = 0) {
            super(parentNode, mapView, location, level, x, y, new THREE.BufferGeometry(), new THREE.MeshBasicMaterial())
            this.visible = false
         }

         public async initialize(): Promise<void> {}

         public createChildNodes(): void {
            const level = this.level + 1
            this.add(new TestNode(this, this.mapView, QuadTreePosition.topLeft, level, 0, 0))
            this.add(new TestNode(this, this.mapView, QuadTreePosition.topRight, level, 1, 0))
            this.add(new TestNode(this, this.mapView, QuadTreePosition.bottomLeft, level, 0, 1))
            this.add(new TestNode(this, this.mapView, QuadTreePosition.bottomRight, level, 1, 1))
         }
      }

      const mapView = {
         cacheTiles: true,
         maxZoom: () => 1,
         minZoom: () => 0,
         materialFactory: null,
         renderOrder: 0,
      }
      const root = new TestNode(undefined, mapView)

      root.subdivide()
      ;(root.children[0] as TestNode).nodeReady()
      ;(root.children[1] as TestNode).nodeReady()

      root.simplify()
      expect(root.children.length).toBe(0)
      expect(root.childrenCache?.length).toBe(4)

      ;(root.childrenCache?.[2] as TestNode).nodeReady()
      ;(root.childrenCache?.[3] as TestNode).nodeReady()

      root.subdivide()

      expect(root.children.length).toBe(4)
      expect((root as any).isMesh).toBe(false)
      for (const child of root.children) {
         expect(child.visible).toBe(true)
      }
   })
})
