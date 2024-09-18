'use client'
import * as THREE from 'three'
import * as Astronomy from 'astronomy-engine'
import { DateValue } from '@nextui-org/react'

export function SolarSystemHelper() {

   /**
    * Helper function to get planet position in 3D (heliocentric coordinates).
    * @param planetBody
    * @param date
    */
   const getPlanetPosition = (planetBody: Astronomy.Body, date: Date) => {
      const time = new Astronomy.AstroTime(date)
      const vector = Astronomy.HelioVector(planetBody, time)
      return new THREE.Vector3(vector.x, vector.y, vector.z)
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

