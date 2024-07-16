import React, { createContext, ReactNode, useContext, useState } from 'react'

interface CreditContextValue {
   isCreditOpen: boolean
   setIsCreditOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const CreditContext = createContext<CreditContextValue | null>(null)

export function useCredit(): CreditContextValue {
   const context = useContext(CreditContext)
   if (!context) {
      throw new Error('useCredit must be used within a CreditProvider')
   }
   return context
}

export function CreditProvider({ children }: { children: ReactNode }) {
   const [isCreditOpen, setIsCreditOpen] = useState<boolean>(false)

   const value: CreditContextValue = {
      isCreditOpen: isCreditOpen,
      setIsCreditOpen: setIsCreditOpen,
   }

   return (
      <CreditContext.Provider value={value}>{children}</CreditContext.Provider>
   )
}
