import React, { createContext, ReactNode, useContext } from 'react'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'

interface OuterSpaceTabContextValue {
   constellationBoundsActivated: boolean
   setConstellationBoundsActivated: React.Dispatch<React.SetStateAction<boolean>>
   constellationFiguresActivated: boolean
   setConstellationFiguresActivated: React.Dispatch<React.SetStateAction<boolean>>
   hypticActivated: boolean
   setHypticActivated: React.Dispatch<React.SetStateAction<boolean>>
}

const OuterSpaceTabContext = createContext<OuterSpaceTabContextValue | null>(
   null,
)

export function useOuterSpaceTab(): OuterSpaceTabContextValue {
   const context = useContext(OuterSpaceTabContext)
   if (!context) {
      throw new Error(
         'useOuterSpaceTab must be used within a OuterSpaceTabProvider',
      )
   }
   return context
}

export function OuterSpaceTabProvider({ children }: { children: ReactNode }) {
   const [constellationBoundsActivated, setConstellationBoundsActivated] =
      useLocalStorageState<boolean>('settings.outerSpace.constellationBounds', false)
   const [constellationFiguresActivated, setConstellationFiguresActivated] =
      useLocalStorageState<boolean>('settings.outerSpace.constellationFigures', false)
   const [hypticActivated, setHypticActivated] = useLocalStorageState<boolean>('settings.outerSpace.hyptic', true)

   const value: OuterSpaceTabContextValue = {
      constellationBoundsActivated,
      setConstellationBoundsActivated,
      constellationFiguresActivated,
      setConstellationFiguresActivated,
      hypticActivated,
      setHypticActivated,
   }

   return (
      <OuterSpaceTabContext.Provider value={value}>
         {children}
      </OuterSpaceTabContext.Provider>
   )
}
