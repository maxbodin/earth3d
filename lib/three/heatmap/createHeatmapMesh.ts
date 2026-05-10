import * as THREE from 'three'
import { SPHERE_HEIGHT_SEGMENTS, SPHERE_WIDTH_SEGMENTS, } from '@/app/constants/numbers'

/**
 *
 * @param texture
 * @param radius
 * @param renderOrder
 * @param name
 */
export function createHeatmapMesh(
   texture: THREE.CanvasTexture,
   radius: number,
   renderOrder: number,
   name: string,
): THREE.Mesh {
   const shaderMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.FrontSide,
      vertexShader: `
         #include <common>
         #include <logdepthbuf_pars_vertex>
         varying vec2 vertexUV;
         void main() {
            vertexUV = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            #include <logdepthbuf_vertex>
         }`,
      fragmentShader: `
         #include <common>
         #include <logdepthbuf_pars_fragment>
         uniform sampler2D heatMapTexture;
         varying vec2 vertexUV;
         void main() {
            vec4 texColor = texture2D(heatMapTexture, vertexUV);
            if (texColor.a < 0.01) discard;
            gl_FragColor = texColor;
            #include <logdepthbuf_fragment>
         }`,
      uniforms: {
         heatMapTexture: { value: texture },
      },
   })

   const geometry = new THREE.SphereGeometry(
      radius,
      SPHERE_WIDTH_SEGMENTS,
      SPHERE_HEIGHT_SEGMENTS,
   )

   const mesh = new THREE.Mesh(geometry, shaderMaterial)
   mesh.renderOrder = renderOrder
   mesh.name = name
   mesh.position.set(0, 0, 0)

   return mesh
}