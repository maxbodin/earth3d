import React, { createContext, ReactNode, useContext } from 'react'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'
import { STORAGE_KEY_VOLCANOES_ACTIVATED } from '@/app/constants/storageKeys'

interface VolcanoesTabContextValue {
   volcanoesActivated: boolean
   setVolcanoesActivated: React.Dispatch<React.SetStateAction<boolean>>
}

const VolcanoesTabContext = createContext<VolcanoesTabContextValue | null>(null)

export function useVolcanoesTab(): VolcanoesTabContextValue {
   const context = useContext(VolcanoesTabContext)
   if (!context) {
      throw new Error('useVolcanoesTab must be used within a VolcanoesTabProvider')
   }
   return context
}

export function VolcanoesTabProvider({ children }: { children: ReactNode }) {
   const [volcanoesActivated, setVolcanoesActivated] = useLocalStorageState<boolean>(
      STORAGE_KEY_VOLCANOES_ACTIVATED, false,
   )

   const value: VolcanoesTabContextValue = {
      volcanoesActivated,
      setVolcanoesActivated,
   }

   return (
      <VolcanoesTabContext.Provider value={value}>
         {children}
      </VolcanoesTabContext.Provider>
   )
}
