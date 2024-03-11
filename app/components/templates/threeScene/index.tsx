import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { Stars } from '../../atoms/stars'
import { Planes } from '../../atoms/planes'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Planet } from '@/app/components/planet'
import { PlanetProvider } from '@/app/context/planetContext'
import { Polyline } from '@/app/components/molecules/polyline'
import { Airports } from '@/app/components/atoms/airports'
import { planetRadius } from '@/app/constants'

export function ThreeScene({
   data,
   onPlaneClick,
}: {
   data: any[]
   onPlaneClick: (data: Record<string, any>) => void
}) {
   const mountRef = useRef<HTMLDivElement>(null)
   const renderer = useRef<THREE.WebGLRenderer | null>(null)
   const scene = useRef<THREE.Scene | null>(null)
   const camera = useRef<THREE.PerspectiveCamera | null>(null)
   const controls = useRef<OrbitControls | null>(null)

   // Resize listener.
   const handleResize = () => {
      if (renderer.current && camera.current) {
         renderer.current.setSize(window.innerWidth, window.innerHeight)
         camera.current.aspect = window.innerWidth / window.innerHeight
         camera.current.updateProjectionMatrix()
      }
   }

   // Function to set up renderer, scene, and camera.
   const setupRendererSceneCamera = (): void => {
      if (!mountRef.current) return

      // Set renderer settings.
      renderer.current = new THREE.WebGLRenderer({
         alpha: true,
         antialias: true,
      })
      renderer.current.setSize(window.innerWidth, window.innerHeight)
      renderer.current.setPixelRatio(window.devicePixelRatio)
      renderer.current.toneMapping = THREE.ACESFilmicToneMapping
      renderer.current.shadowMap.enabled = true
      renderer.current.shadowMap.type = THREE.PCFSoftShadowMap
      // Append renderer to dom.
      mountRef.current.appendChild(renderer.current.domElement)

      // Initialize scene
      scene.current = new THREE.Scene()

      // Initialize camera.
      camera.current = new THREE.PerspectiveCamera(
         75,
         window.innerWidth / window.innerHeight,
         0.001,
         10000
      )
      camera.current.position.set(500, 500, 8)
   }

   // Function to set up controls, lights, and celestial bodies.
   const zoomMinThreshold = 0.1
   const setupControls: () => void = (): void => {
      // Set controls settings.
      controls.current = new OrbitControls(
         camera.current!,
         renderer.current!.domElement
      )
      controls.current.enableDamping = true
      controls.current.dampingFactor = 0.05
      controls.current.rotateSpeed = 0.1
      controls.current.zoomSpeed = 1
      controls.current.enablePan = false
      controls.current.autoRotate = false
      controls.current.minPolarAngle = Math.PI / 5
      controls.current.maxPolarAngle = Math.PI - Math.PI / 5
      controls.current.minDistance = planetRadius + zoomMinThreshold
      controls.current.maxDistance = 10
      controls.current.update()
   }

   const setupLights: () => void = (): void => {
      // Add ambient light.
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.current!.add(ambientLight)

      // Add directional light.
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(0, 1, 0)
      scene.current!.add(directionalLight)
   }

   const animate: () => void = (): void => {
      requestAnimationFrame(animate)

      // TODO: planet.current!.rotation.y += 0.000005;
      controls.current!.update()

      renderer.current?.render(scene.current!, camera.current!)
   }

   // Function to clean up on component unmount.
   const cleanup: () => void = (): void => {
      window.removeEventListener('resize', handleResize)
      if (renderer.current && renderer.current.domElement.parentNode) {
         renderer.current.domElement.parentNode.removeChild(
            renderer.current.domElement
         )
      }
   }

   useEffect(() => {
      window.addEventListener('resize', handleResize)

      if (!mountRef.current) return
      // Set up renderer, scene, and camera.
      setupRendererSceneCamera()
      // Set up controls.
      setupControls()
      // Set up lights.
      setupLights()

      animate()

      return cleanup
   }, [])

   return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
         <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
            <div
               ref={mountRef}
               style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  overflow: 'hidden',
               }}
            />
            <PlanetProvider>
               <Planet scene={scene.current} />
               <Planes
                  data={data}
                  scene={scene.current}
                  camera={camera.current}
                  onPlaneClick={onPlaneClick}
               />
               <Airports
                  scene={scene.current}
                  camera={camera.current}
                  controls={controls.current}
               />
               <Polyline />
            </PlanetProvider>
            <Stars scene={scene.current} />
         </div>
      </main>
   )
}
