import { Body } from 'astronomy-engine'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { clamp } from '@/lib/math/clamp'

const DAYS_PER_YEAR = 365.25
const MILLISECONDS_PER_DAY = 86_400_000
const MIN_TRAJECTORY_SEGMENTS = 96
const MAX_TRAJECTORY_SEGMENTS = 720
const TRAJECTORY_SEGMENTS_PER_YEAR = 180

const ORBITAL_PERIOD_DAYS: Partial<Record<Body, number>> = {
   [Body.Mercury]: 87.969,
   [Body.Venus]: 224.701,
   [Body.Earth]: 365.256,
   [Body.Moon]: 27.322,
   [Body.Mars]: 686.98,
   [Body.Jupiter]: 4332.59,
   [Body.Saturn]: 10759.22,
   [Body.Uranus]: 30688.5,
   [Body.Neptune]: 60182,
   [Body.Pluto]: 90560,
}

const getOrbitalPeriodDays = (body: Body): number | null => {
   return ORBITAL_PERIOD_DAYS[body] ?? null
}

const getTrajectorySegments = (orbitalPeriodDays: number): number => {
   const periodInYears: number = orbitalPeriodDays / DAYS_PER_YEAR
   return clamp(
      Math.round(periodInYears * TRAJECTORY_SEGMENTS_PER_YEAR),
      MIN_TRAJECTORY_SEGMENTS,
      MAX_TRAJECTORY_SEGMENTS,
   )
}

interface BuildTrajectoryPointsArgs {
   body: Body
   centerDate: Date
   getPlanetPosition: (body: Body, date: Date) => THREE.Vector3
   anchorBody?: Body
}

export const buildTrajectoryPoints = ({
                                          body,
                                          centerDate,
                                          getPlanetPosition,
                                          anchorBody,
                                       }: BuildTrajectoryPointsArgs): THREE.Vector3[] => {
   const orbitalPeriodDays = getOrbitalPeriodDays(body)

   if (orbitalPeriodDays == null) {
      return []
   }

   const segmentCount: number = getTrajectorySegments(orbitalPeriodDays)
   const startTimestamp: number = centerDate.getTime() - (orbitalPeriodDays * 0.5 * MILLISECONDS_PER_DAY)
   const points: THREE.Vector3[] = []
   const anchorCenterPosition = anchorBody != null
      ? getPlanetPosition(anchorBody, centerDate)
      : null

   for (let segmentIndex: number = 0; segmentIndex < segmentCount; segmentIndex++) {
      const segmentProgress: number = segmentIndex / segmentCount
      const sampleTimestamp: number = startTimestamp + segmentProgress * orbitalPeriodDays * MILLISECONDS_PER_DAY
      const sampleDate: Date = new Date(sampleTimestamp)
      const bodySamplePosition: Vector3 = getPlanetPosition(body, sampleDate)

      if (anchorBody == null || anchorCenterPosition == null) {
         points.push(bodySamplePosition)
         continue
      }

      const anchorSamplePosition: Vector3 = getPlanetPosition(anchorBody, sampleDate)
      const anchoredBodyPosition: Vector3 = anchorCenterPosition
         .clone()
         .add(bodySamplePosition.clone().sub(anchorSamplePosition))

      points.push(anchoredBodyPosition)
   }

   return points
}
