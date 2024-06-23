import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DynamicProviders } from '@/app/components/templates/providers/dynamicProviders'
import React from 'react'
import { NextFont } from 'next/dist/compiled/@next/font'
import { ErrorSecurity } from '@/app/components/atoms/ui/errorSecurity/errorSecurity'
import { NextUIProvider } from '@nextui-org/react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

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
   gsap.registerPlugin(useGSAP)

   return (
      <html lang="en" className="dark">
      <body className={`overflow-hidden ${inter.className}`}>
      <NextUIProvider>
         <DynamicProviders>
            <ErrorSecurity>{children}</ErrorSecurity>
         </DynamicProviders>
      </NextUIProvider>
      </body>
      </html>
   )
}
