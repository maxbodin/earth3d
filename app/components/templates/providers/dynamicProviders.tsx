'use client'

import React from 'react'
import { ToastProvider } from '@/app/context/toastsContext'
import dynamic from 'next/dynamic'
import { DataProvider } from '@/app/context/dataContext'
import { UiProvider } from '@/app/context/UIContext'
import { DashboardTabsProviders } from '@/app/components/templates/providers/dashboardTabsProviders'
import { DashboardProvider } from '@/app/components/organisms/dashboard/model'
import { CreditProvider } from '@/app/components/organisms/credit/model'

/**
 * Hell.
 * @param children
 * @constructor
 */
export function Providers({ children }: { children: React.ReactNode }) {
   return (
      <UiProvider>
         <ToastProvider>
            <DashboardTabsProviders>
               <DataProvider>
                  <DashboardProvider>
                     <CreditProvider>{children}</CreditProvider>
                  </DashboardProvider>
               </DataProvider>
            </DashboardTabsProviders>
         </ToastProvider>
      </UiProvider>
   )
}

export const DynamicProviders = dynamic(() => Promise.resolve(Providers), {
   ssr: false,
})
