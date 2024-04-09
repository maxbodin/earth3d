import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DynamicProviders } from '@/app/components/templates/providers/dynamicProviders'
import React from 'react'
import { NextFont } from 'next/dist/compiled/@next/font'
import { ErrorSecurity } from '@/app/components/atoms/ui/errorSecurity/errorSecurity'

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
      <html lang="en">
         <body className={`overflow-hidden ${inter.className}`}>
            <DynamicProviders>
               <ErrorSecurity>{children}</ErrorSecurity>
            </DynamicProviders>
         </body>
      </html>
   )
}
