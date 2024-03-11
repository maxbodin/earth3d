import * as THREE from 'three'
import { Vector3 } from 'three'
import { usePlanet } from '@/app/context/planetContext'
import { useEffect } from 'react'
import { useData } from '@/app/context/dataContext'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import {
   MeshLine,
   MeshLineMaterial,
} from '@/app/lib/three.meshline/THREE.MeshLine'

export function Polyline() {
   const { planeTrackData } = useData()
   const { planet } = usePlanet()

   const addPolyline = () => {
      console.log('Path data received in Polyline : ', planeTrackData)

      if (planeTrackData == null || Object.keys(planeTrackData).length <= 0)
         return

      const points: THREE.Vector3[] = []

      // Iterate over the path data and create vectors.
      planeTrackData.forEach((point: (number | undefined)[]) => {
         const position: Vector3 = latLongToVector3(
            point[1] as number,
            point[2] as number
         )

         if (point[3] != null) {
            // Adjust position based on altitude
            const adjustedAltitude: number = (point[3] as number) / 100000
            const normal: Vector3 = position.clone().normalize() // Normal vector from the center of the planet to the point.
            const adjustedPosition: Vector3 = position.add(
               normal.multiplyScalar(adjustedAltitude)
            )
            position.copy(adjustedPosition)
         }

         points.push(position)
      })

      // Create a line object using the geometry and material.
      const line = new MeshLine()
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      line.setGeometry(geometry, (p) => 0.001)
      const material = new MeshLineMaterial({
         isMeshLineMaterial: true,
         resolution: new THREE.Vector2(1, 1),
         color: new THREE.Color(1, 0, 0),
      })
      const mesh = new THREE.Mesh(line, material)

      planet.add(mesh)
   }

   useEffect(() => {
      addPolyline()
   }, [planeTrackData])

   return <></>
}
