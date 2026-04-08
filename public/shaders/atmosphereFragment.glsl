precision highp float;

varying vec3 vNormal;

void main(){
    float intensity = clamp(0.99 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    vec3 color = vec3(0.3, 0.6, 1.0) * pow(intensity, 2.0);
    gl_FragColor = vec4(color, intensity);
}
