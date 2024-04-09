import { useEffect, useRef } from 'react'
import { useScenes } from '@/app/context/scenesContext'
import * as THREE from 'three'
import { latLongToVector3, vector3ToLatLong } from '@/app/helpers/latLongHelper'
import { EARTH_RADIUS } from '@/app/constants/numbers'
import { useVisibleZone } from '@/app/components/atoms/three/visibleZone/model'

export function VisibleZone(): null {
   const { displayedSceneData } = useScenes()
   const { setSphereVisibleZone } = useVisibleZone()
   const visualizationPointsGroup = useRef<THREE.Group>(new THREE.Group())

   /**
    * L'idée de base: Récupérer la coordonée au centre de l'écran pour former une zone rectangulaire projetée sur la sphère.
    * On fait cette action à chaque modification des controls (mouvement de la caméra) pour avoir une zone qui suit la caméra.
    *
    * Résultat obtenu pour l'instant: Grosse baisse de performance parce que c'est pas optimisé.
    * @param showVisualizers
    */
   const onControlsChange = (showVisualizers: boolean = false): void => {
      if (Math.random() < 0.9) return // Obligé sinon trop d'appels.
      if (
         displayedSceneData?.camera == null ||
         displayedSceneData?.controls == null
      )
         return

      // Update the controls
      displayedSceneData.controls.update()

      visualizationPointsGroup.current.clear()

      // Get the corners of the window in screen coordinates.
      const bottomScreen: THREE.Vector3 = new THREE.Vector3(-1, 1, 0) // Top-left corner
      const leftScreen: THREE.Vector3 = new THREE.Vector3(1, 1, 0) // Top-right corner
      const topScreen: THREE.Vector3 = new THREE.Vector3(-1, -1, 0) // Bottom-left corner
      const rightScreen: THREE.Vector3 = new THREE.Vector3(1, -1, 0) // Bottom-right corner

      // Convert screen coordinates to world coordinates.
      const bottomWorld: THREE.Vector3 = new THREE.Vector3()
      const leftWorld: THREE.Vector3 = new THREE.Vector3()
      const topWorld: THREE.Vector3 = new THREE.Vector3()
      const rightWorld: THREE.Vector3 = new THREE.Vector3()

      displayedSceneData.camera.updateMatrixWorld()
      bottomWorld.copy(bottomScreen).unproject(displayedSceneData.camera)
      leftWorld.copy(leftScreen).unproject(displayedSceneData.camera)
      topWorld.copy(topScreen).unproject(displayedSceneData.camera)
      rightWorld.copy(rightScreen).unproject(displayedSceneData.camera)

      // Normalize world coordinates to get direction vectors from the center of the sphere.
      bottomWorld.normalize()
      leftWorld.normalize()
      topWorld.normalize()
      rightWorld.normalize()

      // Scale direction vectors by the radius of the sphere to get coordinates on the sphere's surface.
      const bottomSphere: THREE.Vector3 =
         bottomWorld.multiplyScalar(EARTH_RADIUS)
      const leftSphere: THREE.Vector3 = leftWorld.multiplyScalar(EARTH_RADIUS)
      const topSphere: THREE.Vector3 = topWorld.multiplyScalar(EARTH_RADIUS)
      const rightSphere: THREE.Vector3 = rightWorld.multiplyScalar(EARTH_RADIUS)

      const bottomLatLon = vector3ToLatLong(bottomSphere)
      const leftLatLon = vector3ToLatLong(leftSphere)
      const topLatLon = vector3ToLatLong(topSphere)
      const rightLatLon = vector3ToLatLong(rightSphere)

      const distanceRatio: number =
         displayedSceneData.controls.getDistance() / 1e9
      const hZoneFactor: number = window.innerHeight * 2 * distanceRatio
      const wZoneFactor: number = window.innerWidth * 2 * distanceRatio

      //console.log(hZoneFactor, wZoneFactor)

      bottomLatLon.lat -= hZoneFactor
      leftLatLon.lon -= wZoneFactor
      topLatLon.lat += hZoneFactor
      rightLatLon.lon += wZoneFactor

      setSphereVisibleZone({
         bottomLatLon: bottomLatLon,
         leftLatLon: leftLatLon,
         topLatLon: topLatLon,
         rightLatLon: rightLatLon,
      })

      if (showVisualizers) {
         addVisualizer(bottomLatLon.lat, bottomLatLon.lon, '#ff0000')
         addVisualizer(leftLatLon.lat, leftLatLon.lon, '#00ff00')
         addVisualizer(topLatLon.lat, topLatLon.lon, '#000ff0')
         addVisualizer(rightLatLon.lat, rightLatLon.lon, '#f000f0')

         displayedSceneData.scene.add(visualizationPointsGroup.current)
      }

      function addVisualizer(lat: number, lon: number, color: string): void {
         const visualizer = new THREE.Mesh(
            new THREE.SphereGeometry(1e5, 4, 4),
            new THREE.MeshBasicMaterial({ color: color })
         )
         const visualizerCoords: THREE.Vector3 = latLongToVector3(lat, lon)
         visualizer.position.copy(visualizerCoords)
         visualizationPointsGroup.current?.add(visualizer)
      }
   }

   /**
    * Remove listener.
    */
   const cleanup = (): void => {
      displayedSceneData?.controls?.removeEventListener(
         'change',
         onControlsChange
      )
   }

   useEffect(() => {
      // TODO Remove comment to allow zone compute.
      // TODO Make it better first.
      //  displayedSceneData?.controls?.addEventListener('change', onControlsChange)
      return cleanup
   }, [displayedSceneData])

   return null

   /* TODO Ne pas supprimer, ceci est des pistes d'améliorations.





// TODO VISIBLE ZONE DOIT STORE EN PERMANENCE SOIT LA VISIBLE ZONE DE SPHERICAL SOIT LA VISIBLE ZONE DE PLANAR = FAIRE UN PROVIDER
// TODO POUR SPHERICAL LE FRUSTRUM CONTAINS MARCHE BIEN DONC ON VIRE THEORIQUEMENT LE RAYCAST ON GENERE UN CERTAINS NOMBRE DE POINT OU ALORS ON FAIT LA MEME CHOSE QUE POUR LE SPHERICAL GENRE ON AJOUTER UNE VALEUR AU COORDS EN FONCTION DU ZOOM MAIS LIDEE EN GROS C D'AVOIR UNE BOUNDING BOX FLAT POUR LA MAP ??
// TODO A DATE DU 10 AVRIL LE FRUSTRUM IS POINT IN FRUSTRUM BUG DE FOU SUR LA MAP FLAT DONC IL FAUDRAIT UTILISER GENRE LA POSITION DE LA CAMERA ET LE ZOOM POUR TRACER LA BOUNDING BOX PROJETÉE SUR LA MAP FLAT ??
// TODO UNE AUTRE SOLUTION AU LIEU DE VOULOIR FAIRE DU CULLING SERAIT DE FAIRE PLUTOT PASSER LES COORDONNÉES DE BOUNDING BOX LORS D'UN APPEL POUR RECUPERER LES VESSELS COMME CA C'EST LE BACK QUI COMPUTE LES BATEAUX VALIDES ON MET GENRE UNE DUREE DE RAFRAICHISSEMENT ENTRE CHAQUE APPEL ??




const visibleCoordinates = []


// Get the vertices of the sphere's geometry
const vertices = planet.geometry.vertices
// Array to store visible world coordinates
// Check each vertex of the sphere's geometry
for (let i = 0; i < vertices.length; i++) {
// Clone the vertex and apply the sphere's position to get its world coordinates
const worldCoordinate = vertices[i]
.clone()
.applyMatrix4(planet.matrixWorld)

// Check if the world coordinate is inside the frustum
if (frustum.containsPoint(worldCoordinate)) {
// Add the world coordinate to the array of visible coordinates
visibleCoordinates.push(worldCoordinate)
}
}

console.log('Visible coordinates:', visibleCoordinates)



*/

   /*
// Get the direction the camera is facing
const direction = new THREE.Vector3()
displayedSceneData.camera.getWorldDirection(direction)

// Calculate the position on the sphere's surface using the direction vector
const distanceToSphere =
displayedSceneData.controls.getDistance() - EARTH_RADIUS
const positionOnSphere = new THREE.Vector3()
positionOnSphere
.copy(direction)
.multiplyScalar(distanceToSphere)
.add(displayedSceneData.camera.position)
*/

   /*
// Get the direction the camera is facing
const direction = new THREE.Vector3()
displayedSceneData.camera.getWorldDirection(direction)

// Calculate the position on the sphere's surface using the direction vector
const distanceToSphere =
displayedSceneData.controls.getDistance() - EARTH_RADIUS
const positionOnSphere = new THREE.Vector3()
.copy(direction)
.multiplyScalar(distanceToSphere)
.add(displayedSceneData.camera.position)

// Convert positionOnSphere to spherical coordinates
const sphericalCoordinates = UnitsUtils.vectorToDatums(positionOnSphere)


const daValue =
(sphericalCoordinates.latitude *
displayedSceneData.controls.getDistance()) /
1e7
console.log(displayedSceneData.controls)
console.log('Polar Angle:', displayedSceneData.controls.getPolarAngle())
console.log(
'Azimuth Angle:',
displayedSceneData.controls.getAzimuthalAngle()
)
addVisualizer(daValue, sphericalCoordinates.longitude)
addVisualizer(-daValue, sphericalCoordinates.longitude)
addVisualizer(daValue, -sphericalCoordinates.longitude)
addVisualizer(-daValue, -sphericalCoordinates.longitude)
*/

   /*

// Get the camera's frustum
const frustum = new THREE.Frustum()
frustum.setFromProjectionMatrix(
new THREE.Matrix4().multiplyMatrices(
displayedSceneData.camera.projectionMatrix,
displayedSceneData.camera.matrixWorldInverse
)
)
// Number of points to generate on the sphere's surface
const numPoints = 50 // You can adjust this value based on precision vs performance trade-offs


// Array to store visible world coordinates
const visibleCoordinates = []

// Generate points on the sphere's surface
for (let i = 0; i < numPoints; i++) {
let u = Math.random()
let v = Math.random()
let theta = 2 * Math.PI * u
let phi = Math.acos(2 * v - 1)

let x = Math.sin(phi) * Math.cos(theta)
let y = Math.sin(phi) * Math.sin(theta)
let z = Math.cos(phi)

// Apply sphere's position and scale to get world coordinates
let worldCoordinate = new THREE.Vector3(x, y, z)
.multiplyScalar(EARTH_RADIUS * 1.1)
.add(planet.position)

// Create a ray from the camera to the world coordinate
const raycaster = new THREE.Raycaster(
displayedSceneData.camera.position,
worldCoordinate
.clone()
.sub(displayedSceneData.camera.position)
.normalize()
)

// Check if the ray intersects any objects in the scene
let intersects = raycaster.intersectObjects(
displayedSceneData.scene.children.filter(
(object: any) =>
object.name !== CONSTELLATION_BOUNDS_NAME &&
object.name !== MILKY_WAY_NAME &&
object.name !== GLOBE_SCENE_ATMOSPHERE_NAME
),
true
)

//console.log('intersects', intersects)
// If the ray intersects an object before reaching the point, skip the point
if (intersects.length > 0) {
continue
}

// Check if the world coordinate is inside the frustum
if (frustum.containsPoint(worldCoordinate)) {
// Add the world coordinate to the array of visible coordinates
visibleCoordinates.push(worldCoordinate)
}

const test = new THREE.Mesh(
new THREE.SphereGeometry(1e5, 16, 16),
new THREE.MeshBasicMaterial({ color: '#00ff00' })
)
test.position.set(
worldCoordinate.x,
worldCoordinate.y,
worldCoordinate.z
)

//console.log('Test visible', frustum.intersectsObject(test))
//console.log(frustum.intersectsObject(test))
// Check if the world coordinate is inside the frustum
//if (frustum.containsPoint(worldCoordinate)) {
//visibleCoordinates.push(worldCoordinate)
// Create a ray from the camera to the world coordinate
// const raycaster = new THREE.Raycaster(
//    displayedSceneData.camera.position,
//    worldCoordinate
//       .clone()
//       .sub(displayedSceneData.camera.position)
//       .normalize()
// )
// // Check if the ray intersects with any objects in the scene
// const intersects = raycaster.intersectObject(test, true)
// // If there are no intersections, the point is visible
// if (intersects.length > 0) {
//    // Add the world coordinate to the array of visible coordinates
//    visibleCoordinates.push(worldCoordinate)
// }
//}
}*/
   /*
console.log('Visible coordinates:', visibleCoordinates)

}
*/
}
