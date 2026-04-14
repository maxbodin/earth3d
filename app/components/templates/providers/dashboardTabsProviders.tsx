'use client'

import React from 'react'
import {
   VesselsTabProvider,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/vesselsTab/vesselsTab.model'
import { MapTabProvider } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.model'
import {
   OuterSpaceTabProvider,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/outerSpaceTab/outerSpaceTab.model'
import {
   CountriesTabProvider,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/countriesTab/countriesTab.model'
import {
   AirportsTabProvider,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/airportsTab/airportsTab.model'

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
               <CountriesTabProvider>
                  <AirportsTabProvider>{children}</AirportsTabProvider>
               </CountriesTabProvider>
            </VesselsTabProvider>
         </OuterSpaceTabProvider>
      </MapTabProvider>
   )
}
