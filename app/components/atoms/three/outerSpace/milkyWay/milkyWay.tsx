'use client'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import {
   EARTH_ANGLE,
   EARTH_RADIUS,
   OUTER_SPACE_RADIUS,
   PLANET_DISPLACEMENT_SCALE,
   SPHERE_HEIGHT_SEGMENTS,
   SPHERE_WIDTH_SEGMENTS,
} from '@/app/constants/numbers'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { OUTER_SPACE_RENDER_ORDER } from '@/app/constants/renderOrder'
import { MILKY_WAY_NAME } from '@/app/constants/strings'
import { MILKY_WAY_PNG } from '@/app/constants/paths'
import { removeObject3D } from '@/app/helpers/threeHelper'

export function MilkyWay(): null {
   const milkyWay = useRef<THREE.Mesh | null>(null)
   const { displayedSceneData } = useScenes()
   const milkyWayTexture: THREE.Texture = new THREE.TextureLoader().load(
      MILKY_WAY_PNG,
   )

   /**
    * Function to create the milky way mesh.
    */
   const createMilkyWay = (): void => {
      if (
         displayedSceneData == null ||
         displayedSceneData.scene == null ||
         displayedSceneData.type == SceneType.PLANE
      )
         return

      if (milkyWay.current != null)
         removeObject3D(milkyWay.current, displayedSceneData.scene)

      milkyWay.current = new THREE.Mesh(
         new THREE.SphereGeometry(
            OUTER_SPACE_RADIUS,
            SPHERE_WIDTH_SEGMENTS,
            SPHERE_HEIGHT_SEGMENTS,
         ),
         new THREE.ShaderMaterial({
            vertexShader: `
               uniform float scale;
               varying vec2 vertexUV;
               varying vec3 vertexNormal;
               varying float height;

               void main() {
                  vertexUV = uv;
                  vertexNormal = normalize(normalMatrix * normal);
                  
                  vec3 newPosition = position * 0.991 + normal * scale;
                  
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0 );
               } `,
            fragmentShader: `
               uniform sampler2D globeTexture;
               varying vec2 vertexUV;
               varying vec3 vertexNormal;
               
               void main(){
                  gl_FragColor = vec4(texture2D(globeTexture, vertexUV).xyz, 0.5);
               }`,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: false,
            uniforms: {
               globeTexture: {
                  value: milkyWayTexture,
               },
               scale: {
                  value: EARTH_RADIUS * PLANET_DISPLACEMENT_SCALE,
               },
            },
         }),
      )

      milkyWay.current.rotation.x = THREE.MathUtils.degToRad(EARTH_ANGLE)
      milkyWay.current.name = MILKY_WAY_NAME
      milkyWay.current.renderOrder = OUTER_SPACE_RENDER_ORDER
      displayedSceneData.scene.add(milkyWay.current)
   }

   useEffect((): void => {
      createMilkyWay()
   }, [displayedSceneData])

   return null
}
