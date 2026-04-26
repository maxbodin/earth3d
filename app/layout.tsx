import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import { NextFont } from 'next/dist/compiled/@next/font'
import { ErrorSecurity } from '@/app/components/atoms/ui/errorSecurity'
import { DynamicProviders } from '@/app/components/templates/providers/dynamicProviders'
import { RootClientProviders } from '@/app/components/templates/providers/rootClientProviders'
import { LoadingScreen } from '@/app/components/atoms/ui/loadingScreen'

const inter: NextFont = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
   title: 'Earth 3D',
   description: 'Earth 3D',
}

export default function RootLayout({
                                      children,
                                   }: Readonly<{
   children: React.ReactNode
}>) {
   return (
      <html lang="en" className="dark">
      <body className={`overflow-hidden ${inter.className}`}>
      <LoadingScreen />
      <RootClientProviders>
         <DynamicProviders>
            <ErrorSecurity>{children}</ErrorSecurity>
         </DynamicProviders>
      </RootClientProviders>
      </body>
      </html>
   )
}
