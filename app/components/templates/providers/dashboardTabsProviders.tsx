'use client'

import React from 'react'
import { OuterSpaceTabProvider } from '@/app/components/organisms/dashboardTabs/outerSpaceTab/model'
import { MapTabProvider } from '@/app/components/organisms/dashboardTabs/mapTab/mapTab.model'
import { VesselsTabProvider } from '@/app/components/organisms/dashboardTabs/vesselsTab/vesselsTab.model'
import { CountriesTabProvider } from '@/app/components/organisms/dashboardTabs/countriesTab/countriesTab.model'

/**
 * Hell. x2
 * @param children
 * @constructor
 */
export function DashboardTabsProviders({
                                          children,
                                       }: {
   children: React.ReactNode
}) {
   return (
      <MapTabProvider>
         <OuterSpaceTabProvider>
            <VesselsTabProvider>
               <CountriesTabProvider>{children}</CountriesTabProvider>
            </VesselsTabProvider>
         </OuterSpaceTabProvider>
      </MapTabProvider>
   )
}
