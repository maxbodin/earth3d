'use client'

import React from 'react'
import { ToastProvider } from '@/app/context_todo_improve/toastsContext'
import dynamic from 'next/dynamic'
import { DataProvider } from '@/app/context_todo_improve/dataContext'
import { UiProvider } from '@/app/context_todo_improve/UIContext'
import { DashboardTabsProviders } from '@/app/components/templates/providers/dashboardTabsProviders'
import { DashboardProvider } from '@/app/components/organisms/dashboard/dashboard.model'
import { CreditProvider } from '@/app/components/organisms/credit/credit.model'
import { EntitiesProviders } from '@/app/components/templates/providers/entitiesProviders'
import { SearchBarProvider } from '@/app/components/organisms/searchBar/searchBar.model'
import { MarkersDashboardProvider } from '@/app/components/organisms/markersDashboard/markersDashboard.model'

/**
 * Hell.
 * @param children
 * @constructor
 */
export function Providers({ children }: { children: React.ReactNode }) {
   return (
      <UiProvider>
         <ToastProvider>
            <SearchBarProvider>
               <DashboardTabsProviders>
                  <EntitiesProviders>
                     <DataProvider>
                        <DashboardProvider>
                           <CreditProvider>
                              <MarkersDashboardProvider>{children}</MarkersDashboardProvider>
                           </CreditProvider>
                        </DashboardProvider>
                     </DataProvider>
                  </EntitiesProviders>
               </DashboardTabsProviders>
            </SearchBarProvider>
         </ToastProvider>
      </UiProvider>
   )
}

export const DynamicProviders = dynamic(() => Promise.resolve(Providers), {
   ssr: false,
})
