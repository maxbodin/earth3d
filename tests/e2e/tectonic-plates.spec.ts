import { expect, test } from '@playwright/test'
import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { TECTONIC_PLATES_RENDER_ORDER } from '@/app/constants/renderOrder'
import { STORAGE_KEY_TECTONIC_PLATES } from '@/app/constants/storageKeys'
import {
   applyOpacityToMapView,
   applyTectonicRenderOrder,
   configureTectonicMapView,
   createTectonicMaterialFactory,
   disposeTectonicMapView,
} from '@/app/lib/tectonicPlatesOverlayLayer'
import { openSettingsTab } from '@/tests/e2e/utils/openSettingsTab'

// TODO : Refactor in constants.
const TAB_MAP = 'Map'
const DEFAULT_OPACITY_REF = { current: 1.0 }

test.describe('Tectonic plates render layering', () => {
   test('applies tectonic render order to existing Geo-Three nodes recursively', () => {
      const root = new THREE.Group()
      const child = new THREE.Group()
      const grandChild = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial())

      child.add(grandChild)
      root.add(child)

      applyTectonicRenderOrder(root)

      expect(root.renderOrder).toBe(TECTONIC_PLATES_RENDER_ORDER)
      expect(child.renderOrder).toBe(TECTONIC_PLATES_RENDER_ORDER)
      expect(grandChild.renderOrder).toBe(TECTONIC_PLATES_RENDER_ORDER)
   })

   test('disposeTectonicMapView aborts pending tile controllers and marks nodes disposed', () => {
      const root = new THREE.Group() as THREE.Group & { tileRequestController: any; disposed: boolean }
      const child = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial()) as unknown as THREE.Mesh & { tileRequestController: any; disposed: boolean }

      const abortSpy = { aborted: false, abort() { this.aborted = true } }
      child.tileRequestController = abortSpy
      child.disposed = false
      root.add(child)

      disposeTectonicMapView(root)

      expect(abortSpy.aborted).toBe(true)
      expect(child.tileRequestController).toBeNull()
      expect(child.disposed).toBe(true)
      expect((root as any).disposed).toBe(true)
   })

   test('disposeTectonicMapView also disposes cached children', () => {
      const root = new THREE.Group() as THREE.Group & { childrenCache: THREE.Object3D[]; disposed: boolean }
      const cachedChild = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial()) as unknown as THREE.Mesh & { tileRequestController: any; disposed: boolean }
      const abortSpy = { aborted: false, abort() { this.aborted = true } }

      cachedChild.tileRequestController = abortSpy
      cachedChild.disposed = false
      root.childrenCache = [cachedChild]

      disposeTectonicMapView(root)

      expect(abortSpy.aborted).toBe(true)
      expect(cachedChild.tileRequestController).toBeNull()
      expect(cachedChild.disposed).toBe(true)
      expect(root.disposed).toBe(true)
   })
})

test.describe('Tectonic plates settings toggle', () => {
   test('toggling tectonic plates on writes true to localStorage', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_MAP)

      const tectonicSwitch = page.locator('input[type="checkbox"]').first()
      await expect(tectonicSwitch).toBeVisible()
      await expect(tectonicSwitch).not.toBeChecked()

      await tectonicSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_TECTONIC_PLATES,
      )
      expect(storedValue).toBe('true')
   })

   test('tectonic plates setting persists as enabled on reload', async ({ page }) => {
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_TECTONIC_PLATES,
      )

      await page.reload()
      await openSettingsTab(page, TAB_MAP)

      const tectonicSwitch = page.locator('input[type="checkbox"]').first()
      await expect(tectonicSwitch).toBeVisible()
      await expect(tectonicSwitch).toBeChecked()
   })
})

test.describe('Tectonic plates API route', () => {
   test('returns a valid PNG tile for a valid zoom/x/y', async ({ request }) => {
      const response = await request.get('/api/tectonic-plates/2/1/1')
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toBe('image/png')

      const body = await response.body()
      expect(body.length).toBeGreaterThan(0)

      // Verify PNG magic bytes.
      const pngSignature = [0x89, 0x50, 0x4e, 0x47]
      for (let i = 0; i < pngSignature.length; i++) {
         expect(body[i]).toBe(pngSignature[i])
      }
   })

   test('rejects invalid zoom level', async ({ request }) => {
      const response = await request.get('/api/tectonic-plates/15/0/0')
      expect(response.status()).toBe(400)
   })

   test('rejects out-of-range tile coordinates', async ({ request }) => {
      const response = await request.get('/api/tectonic-plates/2/10/0')
      expect(response.status()).toBe(400)
   })

   test('returns cache-control header for browser caching', async ({ request }) => {
      const response = await request.get('/api/tectonic-plates/0/0/0')
      expect(response.status()).toBe(200)

      const cacheControl = response.headers()['cache-control']
      expect(cacheControl).toContain('public')
      expect(cacheControl).toContain('immutable')
   })

   test('returns consistent content for repeated requests (server cache)', async ({ request }) => {
      const response1 = await request.get('/api/tectonic-plates/1/0/0')
      const response2 = await request.get('/api/tectonic-plates/1/0/0')

      expect(response1.status()).toBe(200)
      expect(response2.status()).toBe(200)

      const body1 = await response1.body()
      const body2 = await response2.body()
      expect(body1.equals(body2)).toBe(true)
   })
})

test.describe('Overlay opacity', () => {
   test('applyOpacityToMapView sets opacity on all mesh materials', () => {
      const root = new THREE.Group()
      const child = new THREE.Mesh(
         new THREE.BufferGeometry(),
         new THREE.MeshBasicMaterial({ opacity: 1, transparent: true }),
      )
      root.add(child)

      applyOpacityToMapView(root, 0.5)

      expect((child.material as THREE.MeshBasicMaterial).opacity).toBe(0.5)
      expect((child.material as THREE.MeshBasicMaterial).transparent).toBe(true)
   })

   test('applyOpacityToMapView sets uOpacity uniform on ShaderMaterials', () => {
      const root = new THREE.Group()
      const shaderMat = new THREE.ShaderMaterial({
         uniforms: { uOpacity: { value: 1.0 } },
         fragmentShader: '',
         vertexShader: '',
      })
      const child = new THREE.Mesh(new THREE.BufferGeometry(), shaderMat)
      root.add(child)

      applyOpacityToMapView(root, 0.3)

      expect(shaderMat.uniforms.uOpacity.value).toBe(0.3)
      expect(shaderMat.transparent).toBe(true)
   })

   test('materialFactory applies opacity from ref to new MeshBasicMaterial nodes', () => {
      const opacityRef = { current: 0.7 }
      const factory = createTectonicMaterialFactory(SceneType.PLANE, opacityRef)

      const material = new THREE.MeshBasicMaterial()
      factory(new THREE.Mesh(), material)

      expect(material.opacity).toBe(0.7)
   })
})
