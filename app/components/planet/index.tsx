'use client'
import React, { useEffect } from 'react'
import * as THREE from 'three'
import { Scene } from 'three'
import {
   planetDisplacementScale,
   planetRadius,
   planetResolutionFactor,
} from '@/app/constants'
import { usePlanet } from '@/app/context/planetContext'

export function Planet({ scene }: { scene: Scene | null }) {
   const { setPlanet } = usePlanet()

   // Preload the map texture.
   const mapTexture = new THREE.TextureLoader().load('/map.jpg')

   const srtmTexture = new THREE.TextureLoader().load(
      '/srtm_ramp2.world.5400x2700.jpg'
   )
   const worldColourTexture = new THREE.TextureLoader().load(
      '/worldColour.5400x2700.jpg'
   )

   // Function to create the planet sphere mesh.
   const createPlanet = () => {
      const planet = new THREE.Mesh(
         new THREE.SphereGeometry(
            planetRadius,
            90 * planetResolutionFactor,
            45 * planetResolutionFactor
         ),
         new THREE.ShaderMaterial({
            vertexShader: `
               uniform sampler2D displacementTexture;
               uniform float scale;
               varying vec2 vertexUV;
               varying vec3 vertexNormal;
               varying float height;

               void main() {
                  vertexUV = uv;
                  vertexNormal = normalize(normalMatrix * normal);
                  
                  height = texture2D(displacementTexture, vertexUV).r;
                  vec3 newPosition = position * 0.99 + normal * height * scale;
                  
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0 );
               } `,
            fragmentShader: `
               uniform sampler2D globeTexture;
               varying vec2 vertexUV;
               varying vec3 vertexNormal;
               varying float height;
               
               void main(){
                  float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
                  vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
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
                  value: planetRadius * planetDisplacementScale,
               },
            },
         })
      )
      scene?.add(planet)

      setPlanet(planet)
   }

   // Function to create the atmosphere mesh.
   const createAtmosphere = () => {
      const atmosphere = new THREE.Mesh(
         new THREE.SphereGeometry(planetRadius, 90, 45),
         new THREE.ShaderMaterial({
            vertexShader: `
                    varying vec3 vertexNormal;
                    void main() {
                        vertexNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
            fragmentShader: `
                    varying vec3 vertexNormal;
                    void main(){
                        float intensity = pow(0.95 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
                        vec3 color = vec3(0.3, 0.6, 1.0) * intensity;
                        gl_FragColor = vec4(color, intensity) ;
                    }
                `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
         })
      )

      const atmosphereScale: number = 1.2
      atmosphere.scale.set(atmosphereScale, atmosphereScale, atmosphereScale)

      scene?.add(atmosphere)
   }

   useEffect(() => {
      createPlanet()
      createAtmosphere()
   }, [scene])

   return <></>
}
