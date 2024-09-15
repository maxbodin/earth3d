import React, { createContext, ReactNode, useContext, useState } from 'react'
import { astres } from '@/app/data/astres'
import { Astre } from '@/app/types/astre'

interface AstresListContextValue {
   selectedAstre: Astre
   setSelectedAstre: React.Dispatch<React.SetStateAction<Astre>>
}

const AstresListContext = createContext<AstresListContextValue | null>(null)

export function useAstresList(): AstresListContextValue {
   const context = useContext(AstresListContext)
   if (!context) {
      throw new Error('useAstresList must be used within a AstresListProvider')
   }
   return context
}

export function AstresListProvider({ children }: { children: ReactNode }) {
   const [selectedAstre, setSelectedAstre] = useState<Astre>(astres[0])

   const value: AstresListContextValue = {
      selectedAstre: selectedAstre,
      setSelectedAstre: setSelectedAstre,
   }

   return (
      <AstresListContext.Provider value={value}>
         {children}
      </AstresListContext.Provider>
   )
}
