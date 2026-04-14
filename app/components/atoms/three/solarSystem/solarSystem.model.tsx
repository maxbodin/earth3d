'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'

interface SolarSystemContextValue {
   trueSize: boolean
   setTrueSize: React.Dispatch<React.SetStateAction<boolean>>
   showTrajectories: boolean
   setShowTrajectories: React.Dispatch<React.SetStateAction<boolean>>
   trajectoryLineWidth: number
   setTrajectoryLineWidth: React.Dispatch<React.SetStateAction<number>>
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
   const [showTrajectories, setShowTrajectories] = useState<boolean>(false)
   const [trajectoryLineWidth, setTrajectoryLineWidth] = useState<number>(2)

   const value: SolarSystemContextValue = {
      trueSize: trueSize,
      setTrueSize: setTrueSize,
      showTrajectories: showTrajectories,
      setShowTrajectories: setShowTrajectories,
      trajectoryLineWidth: trajectoryLineWidth,
      setTrajectoryLineWidth: setTrajectoryLineWidth,
   }

   return (
      <SolarSystemContext.Provider value={value}>
         {children}
      </SolarSystemContext.Provider>
   )
}
