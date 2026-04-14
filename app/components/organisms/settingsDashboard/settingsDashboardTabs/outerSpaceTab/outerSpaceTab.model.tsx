import React, { createContext, ReactNode, useContext, useState } from 'react'

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
      useState<boolean>(false)
   const [constellationFiguresActivated, setConstellationFiguresActivated] =
      useState<boolean>(false)
   const [hypticActivated, setHypticActivated] = useState<boolean>(true)

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
