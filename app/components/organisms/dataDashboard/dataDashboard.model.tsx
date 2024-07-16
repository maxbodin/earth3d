import React, { createContext, ReactNode, useContext, useState } from 'react'

interface DataDashboardContextValue {
   isDataDashboardOpen: boolean
   setIsDataDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DataDashboardContext = createContext<DataDashboardContextValue | null>(null)

export function useDataDashboard(): DataDashboardContextValue {
   const context = useContext(DataDashboardContext)
   if (!context) {
      throw new Error('useDataDashboard must be used within a DataDashboardProvider')
   }
   return context
}

export function DataDashboardProvider({ children }: { children: ReactNode }) {
   const [isDataDashboardOpen, setIsDataDashboardOpen] = useState<boolean>(false)

   const value: DataDashboardContextValue = {
      isDataDashboardOpen: isDataDashboardOpen,
      setIsDataDashboardOpen: setIsDataDashboardOpen,
   }

   return (
      <DataDashboardContext.Provider value={value}>
         {children}
      </DataDashboardContext.Provider>
   )
}
