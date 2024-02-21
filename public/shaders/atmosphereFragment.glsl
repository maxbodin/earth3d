varying vec3 vertexNormal;

void main(){
    float intensity = pow(0.95 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
    float redFactor = clamp(1.0, 0.0, 1.0);
    gl_FragColor = vec4(0.3, vec2(0.6, 1.0), 1.0) * intensity;
}
