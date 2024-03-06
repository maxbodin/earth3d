'use client';
import React, {useEffect} from 'react';
import * as THREE from 'three';
import { sphereRadius } from "@/app/constants";
import {Scene} from "three";
import {usePlanet} from "@/app/context/planetContext";

export function Planet({ scene }: {scene : Scene | null }) {
    const { setPlanet } = usePlanet();

    // Preload the map texture.
    const mapTexture = new THREE.TextureLoader().load("/map.jpg");

    // Function to create the planet sphere mesh.
    const createPlanet = () => {
        const planet = new THREE.Mesh(
            new THREE.SphereGeometry(sphereRadius, 50, 50),
            new THREE.ShaderMaterial({
                vertexShader: 'varying vec2 vertexUV;varying vec3 vertexNormal;void main() {vertexUV = uv;vertexNormal = normalize(normalMatrix * normal);gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}',
                fragmentShader: 'uniform sampler2D globeTexture;varying vec2 vertexUV;varying vec3 vertexNormal;void main(){float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);}',
                uniforms: {
                    globeTexture: {
                        value: mapTexture,
                    },
                },
            }),
        );
        scene?.add(planet);

        setPlanet(planet);
    };

    // Function to create the atmosphere mesh.
    const createAtmosphere = () => {
        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(sphereRadius, 50, 50),
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
            }),

    );

        atmosphere.scale.set(1.2, 1.2, 1.2);

        scene?.add(atmosphere);
    };


    useEffect(() => {
        createPlanet();
        createAtmosphere();
    }, [scene]);

    return (
        <div></div>
    );
}

// TODO:
//  Add le reload automatique toutes les 20 minutes.
//  Filtre sur conditions genre on ground, une checkbox ?
//  Radar pour les bateaux
//  Afficher les aéroports
//  Itinéraire 3d en vue cockpit
//  Afficher itinéraire tracé du vol sélectionné
//  Elevation carte genre 3d avec reliefs
