'use client'
import React, { createContext, ReactNode, useContext } from 'react'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'
import {
   STORAGE_KEY_SOLAR_SYSTEM_TRAJECTORIES,
   STORAGE_KEY_SOLAR_SYSTEM_TRAJECTORY_LINE_WIDTH,
   STORAGE_KEY_SOLAR_SYSTEM_TRUE_SIZE,
} from '@/app/constants/storageKeys'

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
   const [trueSize, setTrueSize] = useLocalStorageState<boolean>(STORAGE_KEY_SOLAR_SYSTEM_TRUE_SIZE, true)
   const [showTrajectories, setShowTrajectories] = useLocalStorageState<boolean>(STORAGE_KEY_SOLAR_SYSTEM_TRAJECTORIES, true)
   const [trajectoryLineWidth, setTrajectoryLineWidth] = useLocalStorageState<number>(STORAGE_KEY_SOLAR_SYSTEM_TRAJECTORY_LINE_WIDTH, 2)

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
