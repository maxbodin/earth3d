'use client'
import * as THREE from 'three'
import * as Astronomy from 'astronomy-engine'
import { DateValue } from '@internationalized/date'

export function SolarSystemHelper() {

   /**
    * Helper function to get planet position in 3D (heliocentric coordinates).
    * @param planetBody
    * @param date
    */
   const getPlanetPosition = (planetBody: Astronomy.Body, date: Date): THREE.Vector3 => {
      const vector: Astronomy.Vector = Astronomy.HelioVector(planetBody, new Astronomy.AstroTime(date))
      return new THREE.Vector3(vector.x, vector.y, vector.z).multiplyScalar(1e10)
   }

   /**
    *
    * @param dateValue
    */
   const dateValueToDate = (dateValue: DateValue): Date => {
      const { year, month, day } = dateValue
      return new Date(year, month - 1, day)
   }

   return {
      getPlanetPosition,
      dateValueToDate,
   }
}

