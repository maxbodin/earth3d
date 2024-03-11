import { planetRadius } from '@/app/constants'
import * as THREE from 'three'

// Function to convert latitude and longitude to Cartesian coordinates.
export function latLongToVector3(lat: number, lon: number) {
   const phi = (lat * Math.PI) / 180
   const theta = ((lon - 180) * Math.PI) / 180
   const x = -(planetRadius * Math.cos(phi) * Math.cos(theta))
   const y = planetRadius * Math.sin(phi)
   const z = planetRadius * Math.cos(phi) * Math.sin(theta)
   return new THREE.Vector3(x, y, z)
}

// Function to convert Cartesian coordinates to latitude and longitude.
export function vector3ToLatLong(vector: THREE.Vector3) {
   const x = vector.x
   const y = vector.y
   const z = vector.z

   const lon = -Math.atan2(z, x) * (180 / Math.PI)
   const hyp = Math.sqrt(x * x + z * z)
   const lat = Math.atan2(y, hyp) * (180 / Math.PI)
   return { lat, lon }
}
