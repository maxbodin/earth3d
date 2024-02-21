'use client'
import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function Planet() {
    const mountRef = useRef<HTMLDivElement>(null);
    const renderer = useRef<THREE.WebGLRenderer | null>(null);
    const camera = useRef<THREE.PerspectiveCamera | null>(null);
    const scene = useRef<THREE.Scene | null>(null);

    const sphereRadius : number = 5;

    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentTime = new Date().getTime();
                if (lastFetchTime && currentTime - lastFetchTime < 60000) {
                    // Data was fetched less than a minute ago, skip fetching
                    return;
                }
                const response = await fetch('https://opensky-network.org/api/states/all');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const jsonData = await response.json();
                setData(jsonData.states || []); // Handle null data
                setIsLoading(false);
                setLastFetchTime(currentTime);
            } catch (error : any) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [lastFetchTime]);

    useEffect(() => {
        if (!mountRef.current /*|| isLoading*/) return;

        // Set renderer settings.
        renderer.current = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.current.setSize(window.innerWidth, window.innerHeight);
        renderer.current.setPixelRatio(window.devicePixelRatio);
        renderer.current.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.current.shadowMap.enabled = true;
        renderer.current.shadowMap.type = THREE.PCFSoftShadowMap;
        // Append renderer to dom.
        mountRef.current.appendChild(renderer.current.domElement);

        // Initialize scene
        scene.current = new THREE.Scene();

        // Initialize camera
        camera.current = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        camera.current.position.set(500, 500, 15);

        // Set controls settings.
        const controls = new OrbitControls(camera.current, renderer.current.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enablePan = false;
        controls.rotateSpeed = 1;
        controls.zoomSpeed = 1;
        controls.autoRotate = false;
        controls.minPolarAngle = Math.PI / 3.5;
        controls.maxPolarAngle = Math.PI - Math.PI / 3;
        controls.minDistance = 10;
        controls.maxDistance = 20;
        controls.update();

        // Add ambient light.
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // Soft white ambient light
        scene.current.add(ambientLight);

        // Add directional light.
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White directional light
        directionalLight.position.set(0, 1, 0); // Set light position
        scene.current.add(directionalLight);

        // Create planet sphere mesh.
        const planet = new THREE.Mesh(
            new THREE.SphereGeometry(sphereRadius, 50, 50),
            new THREE.ShaderMaterial({
                vertexShader: 'varying vec2 vertexUV;varying vec3 vertexNormal;void main() {vertexUV = uv;vertexNormal = normalize(normalMatrix * normal);gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}',
                fragmentShader: 'uniform sampler2D globeTexture;varying vec2 vertexUV;varying vec3 vertexNormal;void main(){float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);}',
                uniforms: {
                    globeTexture: {
                        value: new THREE.TextureLoader().load("/map.jpg"),
                    },
                },
            }),
        );

        // Add planet to scene.
        scene.current.add(planet);

        // Create atmoshpere mesh.
        const atmoshpere = new THREE.Mesh(
            new THREE.SphereGeometry(sphereRadius, 50, 50),
            new THREE.ShaderMaterial({
                vertexShader: 'varying vec3 vertexNormal;void main() {vertexNormal = normalize(normalMatrix * normal);gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}',
                fragmentShader: 'varying vec3 vertexNormal;void main(){float intensity = pow(0.95 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);float redFactor = clamp(1.0, 0.0, 1.0);gl_FragColor = vec4(0.3, vec2(0.6, 1.0), 1.0) * intensity;}',
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
            }),
        );

        // Make the atmosphere 1.1 bigger than the planet.
        atmoshpere.scale.set(1.1, 1.1, 1.1);

        // Add atmoshpere to scene.
        scene.current.add(atmoshpere);

        // Add stars.
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
        });

        const starVertices = [];
        const starsAmount = 10000;
        const starDistance = 3500;
        for (let i = 0; i < starsAmount; i++) {
            const x = (Math.random() - 0.5) * starDistance;
            const y = (Math.random() - 0.5) * starDistance;
            const z = (Math.random() - 0.5) * starDistance;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(starVertices, 3),
        );
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.current.add(stars);

        // Function to convert latitude and longitude to Cartesian coordinates
        function latLongToVector3(lat: number, lon: number) {
            const phi = (lat * Math.PI) / 180;
            const theta = ((lon - 180) * Math.PI) / 180;
            const x = -(sphereRadius * Math.cos(phi) * Math.cos(theta));
            const y = sphereRadius * Math.sin(phi);
            const z = sphereRadius * Math.cos(phi) * Math.sin(theta);
            return new THREE.Vector3(x, y, z);
        }

        // Create group of planes.
        const planesGroup = new THREE.Group();

        data.forEach(state => {
            const lat = state[5];
            const lon = state[6];
            const position = latLongToVector3(lon as number, lat as number); // Assuming Earth radius of 200
            const pointGeometry = new THREE.SphereGeometry(.05, 4, 4);
            const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xFFBF00 });
            const point = new THREE.Mesh(pointGeometry, pointMaterial);
            point.position.copy(position);
            planesGroup.add(point);
        });

        planet.add(planesGroup);

        const planetRotation = () => {
            planet.rotation.y += 0.005;
        };

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            planetRotation();
            controls.update();

            renderer.current?.render(scene.current!, camera.current!);
        };
        animate();

        // Resize listener
        const handleResize = () => {
            if (renderer.current && camera.current) {
                renderer.current.setSize(window.innerWidth, window.innerHeight);
                camera.current.aspect = window.innerWidth / window.innerHeight;
                camera.current.updateProjectionMatrix();
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (renderer.current && renderer.current.domElement.parentNode) {
                renderer.current.domElement.parentNode.removeChild(renderer.current.domElement);
            }
        };
    }, [data, isLoading]);

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
                        overflow: 'hidden'
                    }}
                />
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}
                {data && (
                    <div>
                        <h2>Data from OpenSky Network API:</h2>
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                )}
            </div>
        </main>
    )
        ;
}

// TODO:
//  Add plane model.
//  Add click on plane to display plane informations.
//  Add planes become smaller when zooming.

/*
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const Planet = (props: PlanetProps) => {
    useEffect(() => {
            // instantiate a loader
            const loader = new OBJLoader();

            loader.load(objectPath, function (object) {

                object.scale.set(objectScale, objectScale, objectScale);

                // Get normal of the point on the sphere
                const normal = pointOnSphere.clone().normalize();

                // Align the factory with the normal
                object.lookAt(normal);

                // Random rotation around the z-axis
                object.rotateZ(Math.random() * Math.PI * 2 * 180);

                // Traverse the loaded object's children and apply the material
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });

                factoryGroup.add(object);
            });
        };

        const plane = new GLTFLoader()
            .loadAsync("assets/models/plane_scene.glb")
            .then((gltf) => {
                // Once loaded, get the object from the loaded GLTF data
                const plane = gltf.scene;

                // Load the texture
                const plane_mask_texture = new THREE.TextureLoader().load(
                    "assets/models/plane_mask.png",
                );
            });
*/