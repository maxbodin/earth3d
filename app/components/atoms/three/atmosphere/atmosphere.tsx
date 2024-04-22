'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
   EARTH_RADIUS,
   GLOBE_SCENE_ATMOSPHERE_SPHERE_SCALE,
   PLANE_SCENE_ATMOSPHERE_SPHERE_SCALE,
   SPHERE_HEIGHT_SEGMENTS,
   SPHERE_WIDTH_SEGMENTS,
} from '@/app/constants/numbers'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/components/enums/sceneType'
import {
   GLOBE_SCENE_ATMOSPHERE_NAME,
   PLANE_SCENE_ATMOSPHERE_NAME,
} from '@/app/constants/strings'
import { removeObject3D } from '@/app/helpers/threeHelper'

export function Atmosphere(): null {
   const globeAtmosphere = useRef<THREE.Mesh | null>(null)
   const planeAtmosphere = useRef<THREE.Mesh | null>(null)

   const { displayedSceneData } = useScenes()

   const commonVertexShader: string = `
                    varying vec3 vertexNormal;
                    void main() {
                        vertexNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `

   /**
    * Function to create the atmosphere mesh.
    */
   const createAtmosphere = (): void => {
      if (displayedSceneData == null || displayedSceneData.scene == null) return

      if (displayedSceneData.type == SceneType.PLANE) {
         if (planeAtmosphere.current != null)
            removeObject3D(planeAtmosphere.current, displayedSceneData.scene)

         planeAtmosphere.current = new THREE.Mesh(
            new THREE.SphereGeometry(
               EARTH_RADIUS * PLANE_SCENE_ATMOSPHERE_SPHERE_SCALE,
               SPHERE_WIDTH_SEGMENTS,
               SPHERE_HEIGHT_SEGMENTS
            ),
            new THREE.ShaderMaterial({
               side: THREE.BackSide,
               transparent: false,
               blending: THREE.AdditiveBlending,
               vertexShader: commonVertexShader,
               fragmentShader: `
                    varying vec3 vertexNormal;
                    void main(){
                        float intensity = pow(0.1 - dot(vertexNormal, vec3(0, 1.0, 1.0)), 0.05);
                        vec3 color = vec3(0.3, 0.6, 1.0) * intensity;
                        gl_FragColor = vec4(color, intensity) ;
                    }
                `,
            })
         )

         // Set atmosphere's position centered on user when entering planar scene.
         planeAtmosphere.current?.position.set(
            displayedSceneData?.camera.position.x,
            0,
            displayedSceneData?.camera.position.z
         )
         planeAtmosphere.current.renderOrder = -100
         planeAtmosphere.current.name = PLANE_SCENE_ATMOSPHERE_NAME
         displayedSceneData.scene?.add(planeAtmosphere.current)
      } else if (displayedSceneData.type == SceneType.SPHERICAL) {
         if (globeAtmosphere.current != null)
            removeObject3D(globeAtmosphere.current, displayedSceneData.scene)

         globeAtmosphere.current = new THREE.Mesh(
            new THREE.SphereGeometry(
               EARTH_RADIUS * GLOBE_SCENE_ATMOSPHERE_SPHERE_SCALE,
               SPHERE_WIDTH_SEGMENTS,
               SPHERE_HEIGHT_SEGMENTS
            ),
            new THREE.ShaderMaterial({
               side: THREE.BackSide,
               transparent: true,
               depthWrite: true,
               depthTest: true,
               blending: THREE.AdditiveBlending,
               vertexShader: commonVertexShader,
               fragmentShader: `
                    varying vec3 vertexNormal;
                    void main(){
                        float intensity = pow(0.99 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
                        vec3 color = vec3(0.3, 0.6, 1.0) * intensity;
                        gl_FragColor = vec4(color, intensity) ;
                    }
                `,
            })
         )

         globeAtmosphere.current?.position.set(0, 0, 0)
         globeAtmosphere.current.name = GLOBE_SCENE_ATMOSPHERE_NAME
         displayedSceneData.scene?.add(globeAtmosphere.current)
      }
   }

   useEffect((): void => {
      createAtmosphere()
   }, [displayedSceneData])

   return null
}
