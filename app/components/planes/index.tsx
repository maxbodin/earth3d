import * as THREE from "three";
import React, {useEffect, useRef} from "react";
import {Group, Object3D, Object3DEventMap, Scene, Vector3} from "three";
import {sphereRadius} from "@/app/constants";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {usePlanet} from "@/app/context/planetContext";

export function Planes({  data, scene, camera, onPlaneClick}:
                           {
                               data: any[],
                               scene : Scene | null,
                               camera: THREE.PerspectiveCamera | null,
                               onPlaneClick: (data: Record<string, any>) => void;
                           })
{
    const { planet } = usePlanet();
    const yellowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFBF00 });
    const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x00BFFF });
    const planeScale = 0.001;
    const planesGroup = useRef<Group | null>(new THREE.Group());

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
    const addPlanes = () => {
        console.log("addPlanes called with data: ", data, "Planet is:", planet)
        if (!planesGroup.current) return;

        // Clear previous planes.
        planesGroup.current.clear();

        // Load plane model.
        const loader = new GLTFLoader();
        loader.load(
            '/models/plane.glb',
            (gltf) => {
                const planeTemplate = gltf.scene;

                // Apply yellow material to all meshes in the plane model
                planeTemplate.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = yellowMaterial;
                    }
                });

                data.forEach(state => {
                    console.log("Plane state read : ", state)
                    const lat = state[5];
                    const lon = state[6];
                    const altitude = state[7]; // Altitude represents the distance between the planet and the plane.
                    const trueTrack = state[10]; // True track in decimal degrees clockwise from north.
                    const position: Vector3 = latLongToVector3(lon as number, lat as number);

                    // Adjust position based on altitude
                    const adjustedAltitude: number = altitude / 100000;
                    const normal: Vector3 = position.clone().normalize(); // Normal vector from the center of the planet to the point
                    const adjustedPosition: Vector3 = position.add(normal.multiplyScalar(adjustedAltitude));

                    // Clone plane model
                    const plane = planeTemplate.clone();
                    plane.position.copy(adjustedPosition);

                    // Calculate Z rotation based on true_track
                    if (trueTrack !== null) {
                        plane.rotateY(trueTrack);
                    }

                    plane.scale.set(planeScale, planeScale, planeScale);
                    plane.userData = { data: state };
                    planesGroup.current!.add(plane);
                });
            },
            (xhr) => {
                //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading plane model:', error);
            }
        );

        if (planet && planesGroup.current) {
            planet.add(planesGroup.current);
            scene?.add(planet)
        }
    }

    useEffect(() => {
        // Add event listener to detect clicks on the window.
        window.addEventListener('click', onMouseClick);
        addPlanes();
        return cleanup;
    }, [data]);

    const cleanup = () : void => {
        window.removeEventListener('click', onMouseClick);
    };

    // Function to handle click events.
    const selectedPlane = useRef<Object3D<Object3DEventMap> | null>(null);
    const onMouseClick = (event: { clientX: number; clientY: number; }) : void => {
        if(camera == null) return;

        // Create a raycaster.
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // Ensure planesGroup is not null.
        if (!planesGroup.current) {
            console.error("planesGroup is null");
            return;
        }

        const intersects = raycaster.intersectObjects(planesGroup.current!.children);

        if (intersects.length > 0) {
            if(selectedPlane.current){
                // Reset mesh material to yellow.
                selectedPlane.current.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = yellowMaterial;
                    }
                });
            }

            selectedPlane.current = intersects[0].object.parent!;

            // Apply blue material to all meshes in the plane model, this is the selected plane.
            intersects[0].object.parent!.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = blueMaterial;
                }
            });

            onPlaneClick(intersects[0].object.parent!.userData);
        }
    };

    return (
        <div></div>
    )
}


