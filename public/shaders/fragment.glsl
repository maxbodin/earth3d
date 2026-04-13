precision highp float;

uniform sampler2D globeTexture;

varying vec2 vUv;
varying vec3 vNormal;

void main(){
    vec3 globeColor = texture2D(globeTexture, vUv).rgb;
    float intensity = clamp(0.15 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.8);
    gl_FragColor = vec4(globeColor + atmosphere, 1.0);
}