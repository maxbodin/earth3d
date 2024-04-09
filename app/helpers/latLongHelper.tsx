import { EARTH_RADIUS } from '@/app/constants/numbers'
import * as THREE from 'three'

/**
 * Function to convert latitude and longitude to Cartesian coordinates.
 * @param lat
 * @param lon
 */
export function latLongToVector3(lat: number, lon: number): THREE.Vector3 {
   const phi: number = (lat * Math.PI) / 180
   const theta: number = ((lon - 180) * Math.PI) / 180
   const x: number = -(EARTH_RADIUS * Math.cos(phi) * Math.cos(theta))
   const y: number = EARTH_RADIUS * Math.sin(phi)
   const z: number = EARTH_RADIUS * Math.cos(phi) * Math.sin(theta)
   return new THREE.Vector3(x, y, z)
}

/**
 * Function to convert Cartesian coordinates to latitude and longitude.
 * @param vector
 */
export function vector3ToLatLong(vector: THREE.Vector3): {
   lat: number
   lon: number
} {
   const x: number = vector.x
   const y: number = vector.y
   const z: number = vector.z

   const lon: number = -Math.atan2(z, x) * (180 / Math.PI)
   const hyp: number = Math.sqrt(x * x + z * z)
   const lat: number = Math.atan2(y, hyp) * (180 / Math.PI)
   return { lat, lon }
}
