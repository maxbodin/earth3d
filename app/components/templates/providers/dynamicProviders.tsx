'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { UiProvider } from '@/app/context_todo_improve/UIContext'
import { DashboardTabsProviders } from '@/app/components/templates/providers/dashboardTabsProviders'
import { CreditProvider } from '@/app/components/organisms/credit/credit.model'
import { EntitiesProviders } from '@/app/components/templates/providers/entitiesProviders'
import { SearchBarProvider } from '@/app/components/organisms/searchBar/searchBar.model'
import { MarkersDashboardProvider } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { DataDashboardProvider } from '@/app/components/organisms/dataDashboard/dataDashboard.model'
import { SettingsDashboardProvider } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'
import { SelectionProvider } from '@/app/components/atoms/clickHandler/selectionContext'

/**
 * Hell.
 * @param children
 * @constructor
 */
export function Providers({ children }: { children: React.ReactNode }) {
   return (
      <UiProvider>
         <SearchBarProvider>
            <DashboardTabsProviders>
               <EntitiesProviders>
                  <SelectionProvider>
                        <DashboardTabsProviders>
                           <DrawerProviders>
                              {children}
                           </DrawerProviders>
                        </DashboardTabsProviders>
                  </SelectionProvider>
               </EntitiesProviders>
            </DashboardTabsProviders>
         </SearchBarProvider>
      </UiProvider>
   )
}

export const DynamicProviders = dynamic(() => Promise.resolve(Providers), {
   ssr: false,
})

/**
 * Hell, for drawers.
 * @param children
 * @constructor
 */
export function DrawerProviders({ children }: { children: React.ReactNode }) {
   return (
      <SettingsDashboardProvider>
         <CreditProvider>
            <MarkersDashboardProvider>
               <DataDashboardProvider>{children}</DataDashboardProvider>
            </MarkersDashboardProvider>
         </CreditProvider>
      </SettingsDashboardProvider>
   )
}