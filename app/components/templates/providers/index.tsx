'use client'

import React from 'react'
import { ToastProvider } from '@/app/context/toastsContext'
import dynamic from 'next/dynamic'
import { DataProvider } from '@/app/context/dataContext'

export function Providers({ children }: { children: React.ReactNode }) {
   return (
      <ToastProvider>
         <DataProvider>{children}</DataProvider>
      </ToastProvider>
   )
}

export const DynamicProviders = dynamic(() => Promise.resolve(Providers), {
   ssr: false,
})
