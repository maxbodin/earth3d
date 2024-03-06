import * as THREE from "three";
import React, {useEffect} from "react";
import {Scene} from "three";

export function Stars({ scene }: {scene : Scene | null }) {

    useEffect(() => {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

        // Function to generate star vertices.
        const generateStarVertices = () => {
            const starVertices = [];
            const starsAmount = 100000;
            const starDistance = 4000;

            for (let i = 0; i < starsAmount; i++) {
                const x = (Math.random() - 0.5) * starDistance;
                const y = (Math.random() - 0.5) * starDistance;
                const z = (Math.random() - 0.5) * starDistance;
                starVertices.push(x, y, z);
            }

            return starVertices;
        };

        const starVertices = generateStarVertices();

        starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene?.add(stars);
    }, [scene]);

    return (
        <div></div>
    )
}


