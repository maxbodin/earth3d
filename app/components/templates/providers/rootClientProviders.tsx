'use client'

import React from 'react'
import { NextUIProvider } from '@nextui-org/react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function RootClientProviders({
   children,
}: Readonly<{
   children: React.ReactNode
}>) {
   return <NextUIProvider locale="en-GB">{children}</NextUIProvider>
}
