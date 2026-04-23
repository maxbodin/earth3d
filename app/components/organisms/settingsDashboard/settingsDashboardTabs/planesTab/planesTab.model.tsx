import React, { createContext, ReactNode, useContext, useState } from 'react'

interface PlanesTabContextValue {
   planesActivated: boolean
   setPlanesActivated: React.Dispatch<React.SetStateAction<boolean>>
}

const PlanesTabContext = createContext<PlanesTabContextValue | null>(null)

export function usePlanesTab(): PlanesTabContextValue {
   const context = useContext(PlanesTabContext)
   if (!context) {
      throw new Error('usePlanesTab must be used within a PlanesTabProvider')
   }

   return context
}

export function PlanesTabProvider({ children }: { children: ReactNode }) {
   const [planesActivated, setPlanesActivated] = useState<boolean>(true)

   const value: PlanesTabContextValue = {
      planesActivated,
      setPlanesActivated,
   }

   return (
      <PlanesTabContext.Provider value={value}>
         {children}
      </PlanesTabContext.Provider>
   )
}