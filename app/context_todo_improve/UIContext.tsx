import React, { createContext, ReactNode, useContext, useState } from 'react'
import { PanelType } from '@/app/enums/panelType'

interface UiContextValue {
   openedPanelType: PanelType
   setOpenedPanelType: React.Dispatch<React.SetStateAction<PanelType>>
   isNavBarDisplayed: boolean
   setIsNavBarDisplayed: React.Dispatch<React.SetStateAction<boolean>>
   isSearchBarDisplayed: boolean
   setIsSearchBarDisplayed: React.Dispatch<React.SetStateAction<boolean>>
}

const UiContext = createContext<UiContextValue | null>(null)

export function useUi(): UiContextValue {
   const context = useContext(UiContext)
   if (!context) {
      throw new Error('useUi must be used within a UiProvider')
   }
   return context
}

export function UiProvider({ children }: { children: ReactNode }) {
   const [openedPanelType, setOpenedPanelType] = useState<PanelType>(
      PanelType.NULL,
   )
   const [isNavBarDisplayed, setIsNavBarDisplayed] = useState<boolean>(true)
   const [isSearchBarDisplayed, setIsSearchBarDisplayed] =
      useState<boolean>(true)

   const value: UiContextValue = {
      openedPanelType: openedPanelType,
      setOpenedPanelType: setOpenedPanelType,
      isNavBarDisplayed: isNavBarDisplayed,
      setIsNavBarDisplayed: setIsNavBarDisplayed,
      isSearchBarDisplayed: isSearchBarDisplayed,
      setIsSearchBarDisplayed: setIsSearchBarDisplayed,
   }

   return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}
