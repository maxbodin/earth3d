const SHADER_PRECISION = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
   precision highp float;
#else
   precision mediump float;
#endif
precision mediump int;
`

const SHADERS = {
   PLANET_VERTEX_SHADER: `
      ${SHADER_PRECISION}
      #include <common>
      #include <logdepthbuf_pars_vertex>
      
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform sampler2D displacementTexture;
      uniform float scale;
      
      void main() {
         vUv = uv;
         vNormal = normalize(normalMatrix * normal);
      
         float height = texture2D(displacementTexture, vUv).r;
         vec3 displacedPosition = position + normal * height * scale;
      
         gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
         #include <logdepthbuf_vertex>
      }`,
   PLANET_FRAGMENT_SHADER: `
      ${SHADER_PRECISION}
      #include <common>
      #include <logdepthbuf_pars_fragment>
      
      uniform sampler2D globeTexture;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
         vec3 globeColor = texture2D(globeTexture, vUv).rgb;
         float intensity = clamp(0.15 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
         vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.8);
      
         gl_FragColor = vec4(globeColor + atmosphere, 1.0);
         #include <logdepthbuf_fragment>
      }`,
   ATMOSPHERE_VERTEX_SHADER: `
      ${SHADER_PRECISION}
      #include <common>
      #include <logdepthbuf_pars_vertex>
      
      varying vec3 vNormal;
      
      void main() {
         vNormal = normalize(normalMatrix * normal);
         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
         #include <logdepthbuf_vertex>
      }`,
   ATMOSPHERE_FRAGMENT_SHADER: `
      ${SHADER_PRECISION}
      #include <common>
      #include <logdepthbuf_pars_fragment>
      
      varying vec3 vNormal;
      
      void main() {
         float intensity = clamp(0.99 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
         vec3 color = vec3(0.3, 0.6, 1.0) * pow(intensity, 2.0);
      
         gl_FragColor = vec4(color, intensity);
         #include <logdepthbuf_fragment>
      }`,
   MILKY_WAY_VERTEX_SHADER: `
      ${SHADER_PRECISION}
      #include <common>
      #include <logdepthbuf_pars_vertex>
      
      varying vec2 vUv;
      uniform float scale;
      
      void main() {
         vUv = uv;
      
         vec3 newPosition = position * 0.991 + normal * scale;
         gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
         #include <logdepthbuf_vertex>
      }`,
   MILKY_WAY_FRAGMENT_SHADER: `
      ${SHADER_PRECISION}
      #include <common>
      #include <logdepthbuf_pars_fragment>
      
      uniform sampler2D globeTexture;
      varying vec2 vUv;
      
      void main() {
         vec3 textureColor = texture2D(globeTexture, vUv).rgb;
         gl_FragColor = vec4(textureColor, 0.5);
         #include <logdepthbuf_fragment>
      }`,
   SOLAR_SYSTEM_VERTEX_SHADER: `
      ${SHADER_PRECISION}
      #include <common>
      #include <logdepthbuf_pars_vertex>
      
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
         vUv = uv;
         vNormal = normalize(normalMatrix * normal);
         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
         #include <logdepthbuf_vertex>
      }`,
   SOLAR_SYSTEM_FRAGMENT_SHADER: `
      ${SHADER_PRECISION}
      #include <common>
      #include <logdepthbuf_pars_fragment>
      
      uniform sampler2D globeTexture;
      uniform vec3 atmosphereColor;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
         vec3 globeColor = texture2D(globeTexture, vUv).rgb;
         float intensity = clamp(0.1 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
         vec3 atmosphere = atmosphereColor * pow(intensity, 1.8);
      
         gl_FragColor = vec4(globeColor + atmosphere, 1.0);
         #include <logdepthbuf_fragment>
      }`,
} as const

export const PLANET_VERTEX_SHADER = SHADERS.PLANET_VERTEX_SHADER
export const PLANET_FRAGMENT_SHADER = SHADERS.PLANET_FRAGMENT_SHADER
export const ATMOSPHERE_VERTEX_SHADER = SHADERS.ATMOSPHERE_VERTEX_SHADER
export const ATMOSPHERE_FRAGMENT_SHADER = SHADERS.ATMOSPHERE_FRAGMENT_SHADER
export const MILKY_WAY_VERTEX_SHADER = SHADERS.MILKY_WAY_VERTEX_SHADER
export const MILKY_WAY_FRAGMENT_SHADER = SHADERS.MILKY_WAY_FRAGMENT_SHADER
export const SOLAR_SYSTEM_VERTEX_SHADER = SHADERS.SOLAR_SYSTEM_VERTEX_SHADER
export const SOLAR_SYSTEM_FRAGMENT_SHADER = SHADERS.SOLAR_SYSTEM_FRAGMENT_SHADER