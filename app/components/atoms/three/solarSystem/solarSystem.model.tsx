'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'

interface SolarSystemContextValue {
   trueSize: boolean
   setTrueSize: React.Dispatch<React.SetStateAction<boolean>>
}

const SolarSystemContext = createContext<SolarSystemContextValue | null>(null)

export function useSolarSystem(): SolarSystemContextValue {
   const context = useContext(SolarSystemContext)
   if (!context) {
      throw new Error('useSolarSystem must be used within a SolarSystemProvider')
   }
   return context
}

export function SolarSystemProvider({ children }: { children: ReactNode }) {
   const [trueSize, setTrueSize] = useState<boolean>(true)

   const value: SolarSystemContextValue = {
      trueSize: trueSize,
      setTrueSize: setTrueSize,
   }

   return (
      <SolarSystemContext.Provider value={value}>
         {children}
      </SolarSystemContext.Provider>
   )
}
