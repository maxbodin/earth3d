import React, { createContext, ReactNode, useContext, useState } from 'react'

interface MarkersDashboardContextValue {
   isMarkersDashboardOpen: boolean
   setIsMarkersDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const MarkersDashboardContext = createContext<MarkersDashboardContextValue | null>(null)

export function useMarkersDashboard(): MarkersDashboardContextValue {
   const context = useContext(MarkersDashboardContext)
   if (!context) {
      throw new Error('useMarkersDashboard must be used within a MarkersDashboardProvider')
   }
   return context
}

export function MarkersDashboardProvider({ children }: { children: ReactNode }) {
   const [isMarkersDashboardOpen, setIsMarkersDashboardOpen] = useState<boolean>(false)

   const value: MarkersDashboardContextValue = {
      isMarkersDashboardOpen: isMarkersDashboardOpen,
      setIsMarkersDashboardOpen: setIsMarkersDashboardOpen,
   }

   return (
      <MarkersDashboardContext.Provider value={value}>
         {children}
      </MarkersDashboardContext.Provider>
   )
}
