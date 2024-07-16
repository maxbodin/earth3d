import React, { createContext, ReactNode, useContext, useState } from 'react'
import { TabType } from '@/app/enums/tabType'

interface SettingsDashboardContextValue {
   isSettingsDashboardOpen: boolean
   setIsSettingsDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>
   activeSettingsDashboardTab: TabType
   setActiveSettingsDashboardTab: React.Dispatch<React.SetStateAction<TabType>>
}

const SettingsDashboardContext = createContext<SettingsDashboardContextValue | null>(null)

export function useSettingsDashboard(): SettingsDashboardContextValue {
   const context = useContext(SettingsDashboardContext)
   if (!context) {
      throw new Error('useSettingsDashboard must be used within a SettingsDashboardProvider')
   }
   return context
}

export function SettingsDashboardProvider({ children }: { children: ReactNode }) {
   const [isSettingsDashboardOpen, setIsSettingsDashboardOpen] = useState<boolean>(false)
   const [activeSettingsDashboardTab, setActiveSettingsDashboardTab] = useState<TabType>(
      TabType.PLANES,
   )

   const value: SettingsDashboardContextValue = {
      isSettingsDashboardOpen: isSettingsDashboardOpen,
      setIsSettingsDashboardOpen: setIsSettingsDashboardOpen,
      activeSettingsDashboardTab: activeSettingsDashboardTab,
      setActiveSettingsDashboardTab: setActiveSettingsDashboardTab,
   }

   return (
      <SettingsDashboardContext.Provider value={value}>
         {children}
      </SettingsDashboardContext.Provider>
   )
}
