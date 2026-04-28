import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react'
import { TabType } from '@/app/enums/tabType'
import { useUi } from '@/app/context/uiContext'

interface SettingsDashboardContextValue {
   isSettingsDashboardOpen: boolean
   setIsSettingsDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>
   handleSettingsOpenChange: (isOpen: boolean) => void
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

   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const handleSettingsOpenChange = useCallback((isOpen: boolean): void => {
      setIsSettingsDashboardOpen(isOpen)
      if (!isOpen) {
         setIsNavBarDisplayed(true)
         setIsSearchBarDisplayed(true)
      }
   }, [setIsSettingsDashboardOpen, setIsNavBarDisplayed, setIsSearchBarDisplayed])

   const value: SettingsDashboardContextValue = {
      isSettingsDashboardOpen: isSettingsDashboardOpen,
      setIsSettingsDashboardOpen: setIsSettingsDashboardOpen,
      handleSettingsOpenChange: handleSettingsOpenChange,
      activeSettingsDashboardTab: activeSettingsDashboardTab,
      setActiveSettingsDashboardTab: setActiveSettingsDashboardTab,
   }

   return (
      <SettingsDashboardContext.Provider value={value}>
         {children}
      </SettingsDashboardContext.Provider>
   )
}
