'use client'

import React from 'react'
import { OuterSpaceTabProvider } from '@/app/components/organisms/dashboardTabs/outerSpaceTab/model'
import { MapTabProvider } from '@/app/components/organisms/dashboardTabs/mapTab/model'
import { VesselsTabProvider } from '@/app/components/organisms/dashboardTabs/vesselsTab/model'

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
            <VesselsTabProvider>{children}</VesselsTabProvider>
         </OuterSpaceTabProvider>
      </MapTabProvider>
   )
}
