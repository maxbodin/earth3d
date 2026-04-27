import React, { createContext, ReactNode, useContext } from 'react'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'

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
   const [planesActivated, setPlanesActivated] = useLocalStorageState<boolean>('settings.planes.activated', true)

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