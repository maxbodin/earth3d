'use client'
import { useEffect } from 'react'
import * as THREE from 'three'
import {
   EARTH_RADIUS,
   PLANET_DISPLACEMENT_SCALE,
   PLANET_RESOLUTION_FACTOR,
   SPHERE_HEIGHT_SEGMENTS,
   SPHERE_WIDTH_SEGMENTS,
} from '@/app/constants/numbers'
import { usePlanet } from '@/app/context/planetContext'
import { PLANET_NAME } from '@/app/constants/strings'
import {
   DISPLACEMENT_MAP_TEXTURE_JPG,
   MAP_TEXTURE_JPG,
} from '@/app/constants/paths'
import { EARTH_RENDER_ORDER } from '@/app/constants/renderOrder'
import { useScenes } from '@/app/context/scenesContext'
import { SceneType } from '@/app/components/enums/sceneType'

export function Planet(): null {
   const { displayedSceneData } = useScenes()
   const { setPlanet } = usePlanet()

   // Preload the map texture.
   const mapTexture: THREE.Texture = new THREE.TextureLoader().load(
      MAP_TEXTURE_JPG
   )
   // Preload the displacement map texture.
   const srtmTexture: THREE.Texture = new THREE.TextureLoader().load(
      DISPLACEMENT_MAP_TEXTURE_JPG
   )

   // Function to create the planet sphere mesh.
   const createPlanet = (): void => {
      if (
         displayedSceneData == null ||
         displayedSceneData.scene == null ||
         srtmTexture == null ||
         mapTexture == null ||
         displayedSceneData.type == SceneType.PLANE
      )
         return

      //if (planet != null) removeObject3D(planet, scene)

      const newPlanet: THREE.Mesh<
         THREE.SphereGeometry,
         THREE.ShaderMaterial,
         THREE.Object3DEventMap
      > = new THREE.Mesh(
         new THREE.SphereGeometry(
            EARTH_RADIUS,
            SPHERE_WIDTH_SEGMENTS * PLANET_RESOLUTION_FACTOR,
            SPHERE_HEIGHT_SEGMENTS * PLANET_RESOLUTION_FACTOR
         ),

         new THREE.ShaderMaterial({
            side: THREE.FrontSide,
            transparent: true,
            depthWrite: true,
            depthTest: true,
            vertexShader: `
               varying vec2 vertexUV;
               varying vec3 vertexNormal;
               varying float height;
               uniform sampler2D displacementTexture;
               uniform float scale;
               
               void main() {
                  vertexUV = uv;
                  vertexNormal = normalize(normalMatrix * normal);
               
                  height = texture2D(displacementTexture, vertexUV).r;
                  vec3 newPosition = position + normal * height * scale;
                  
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
               } `,
            fragmentShader: `
               uniform sampler2D globeTexture;
               varying vec2 vertexUV;
               varying vec3 vertexNormal;
               
               void main(){
                  float intensity = 0.1 - dot(vertexNormal, vec3(0.0, 0.0, 0.0));
                  vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.8);
                  
                  gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
               }`,

            uniforms: {
               globeTexture: {
                  value: mapTexture,
               },
               displacementTexture: {
                  value: srtmTexture,
               },
               scale: {
                  value: EARTH_RADIUS * PLANET_DISPLACEMENT_SCALE,
               },
            },
         })
      )

      newPlanet.name = PLANET_NAME
      newPlanet.renderOrder = EARTH_RENDER_ORDER

      setPlanet(newPlanet)
      displayedSceneData.scene?.add(newPlanet)
   }

   /* TODO CLEAN UP CODE
  const distance = useRef(EARTH_RADIUS * 2)
   const isWatchingAirport = useRef(false)
const onDistanceChange = (): void => {
if (controls == null || scene == null) return

// removeObject3D(planet, scene)

const currentDistance: number = controls.getDistance()

if (currentDistance.toFixed(2) != distance.current.toFixed(2)) {
if (currentDistance > ZOOM_THRESHOLD) {
if (isWatchingAirport.current) {
planet.material.uniforms.scale.value =
EARTH_RADIUS * PLANET_DISPLACEMENT_SCALE
}
isWatchingAirport.current = false
} else if (currentDistance <= ZOOM_THRESHOLD) {
if (!isWatchingAirport.current) {
planet.material.uniforms.scale.value = 0
}
isWatchingAirport.current = true
}
}

distance.current = currentDistance
}*/

   /*useEffect(() => {
// Initialize distance.
if (displayedSceneData.controls) {
//distance.current = controls.getDistance()
createPlanet()
// Attach listener.
//controls.addEventListener('change', onDistanceChange)
}

// Clean up.
return (): void => {
//controls?.removeEventListener('change', onDistanceChange)
}
}, [displayedSceneData])*/

   useEffect((): void => {
      createPlanet()
   }, [displayedSceneData])

   return null
}
