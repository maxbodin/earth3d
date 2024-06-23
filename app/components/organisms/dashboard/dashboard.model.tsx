import React, { createContext, ReactNode, useContext, useState } from 'react'
import { TabType } from '@/app/enums/tabType'

interface DashboardContextValue {
   isDashboardOpen: boolean
   setIsDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>
   activeDashboardTab: TabType
   setActiveDashboardTab: React.Dispatch<React.SetStateAction<TabType>>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboard(): DashboardContextValue {
   const context = useContext(DashboardContext)
   if (!context) {
      throw new Error('useDashboard must be used within a DashboardProvider')
   }
   return context
}

export function DashboardProvider({ children }: { children: ReactNode }) {
   const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false)
   const [activeDashboardTab, setActiveDashboardTab] = useState<TabType>(
      TabType.PLANES,
   )

   const value: DashboardContextValue = {
      isDashboardOpen: isDashboardOpen,
      setIsDashboardOpen: setIsDashboardOpen,
      activeDashboardTab: activeDashboardTab,
      setActiveDashboardTab: setActiveDashboardTab,
   }

   return (
      <DashboardContext.Provider value={value}>
         {children}
      </DashboardContext.Provider>
   )
}
