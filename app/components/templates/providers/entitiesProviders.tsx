'use client'

import React from 'react'
import { VesselsProvider } from '@/app/components/atoms/three/vessels/vessels.model'
import { AirportsProvider } from '@/app/components/atoms/three/airports/airports.model'
import { PlanesProvider } from '@/app/components/atoms/three/planes/planes.model'

/**
 * Hell. x3
 * @param children
 * @constructor
 */
export function EntitiesProviders({ children }: { children: React.ReactNode }) {
   return (
      <VesselsProvider>
         <AirportsProvider>
            <PlanesProvider>{children}</PlanesProvider>
         </AirportsProvider>
      </VesselsProvider>
   )
}
