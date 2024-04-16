import React, { createContext, ReactNode, useContext, useState } from 'react'
import { TabType } from '@/app/components/enums/tabType'

interface CreditContextValue {
   isCreditOpen: boolean
   setIsCreditOpen: React.Dispatch<React.SetStateAction<any>>
   activeCreditTab: TabType
   setActiveCreditTab: React.Dispatch<React.SetStateAction<any>>
}

// Create context.
const CreditContext = createContext<CreditContextValue | null>(null)

// Custom hook to access context.
export function useCredit(): CreditContextValue {
   const context = useContext(CreditContext)
   if (!context) {
      throw new Error('useCredit must be used within a CreditProvider')
   }
   return context
}

// Provider component.
export function CreditProvider({ children }: { children: ReactNode }) {
   const [isCreditOpen, setIsCreditOpen] = useState<boolean>(false)
   const [activeCreditTab, setActiveCreditTab] = useState<TabType>(
      TabType.PLANES
   )

   const value: CreditContextValue = {
      isCreditOpen: isCreditOpen,
      setIsCreditOpen: setIsCreditOpen,
      activeCreditTab: activeCreditTab,
      setActiveCreditTab: setActiveCreditTab,
   }

   return (
      <CreditContext.Provider value={value}>{children}</CreditContext.Provider>
   )
}
