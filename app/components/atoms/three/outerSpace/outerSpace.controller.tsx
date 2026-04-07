'use client'
import React from 'react'
import { ConstellationBounds } from '@/app/components/atoms/three/outerSpace/constellationBounds/constellationBounds'
import { ConstellationFigures } from '@/app/components/atoms/three/outerSpace/constellationFigures/constellationFigures'
import { Hyptic } from '@/app/components/atoms/three/outerSpace/hyptic/hyptic'
import { MilkyWay } from '@/app/components/atoms/three/outerSpace/milkyWay/milkyWay'

export function OuterSpaceController(): React.JSX.Element {
   return (
      <>
         <MilkyWay />
         <ConstellationBounds />
         <ConstellationFigures />
         <Hyptic />
      </>
   )
}
