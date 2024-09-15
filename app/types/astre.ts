import * as THREE from 'three'
import * as Astronomy from 'astronomy-engine'

export interface Astre {
   name: string,
   radius: number,                        // Radius in meters.
   color: number,                         // Hex color for visualization.
   surfacePressure?: number,              // Surface pressure in pascals (Pa).
   mass?: number,                         // Mass in kg.
   astreMesh: THREE.Mesh,
   body: Astronomy.Body
}