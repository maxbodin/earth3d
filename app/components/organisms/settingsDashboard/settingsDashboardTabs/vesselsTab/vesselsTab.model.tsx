import React, { createContext, ReactNode, useContext, useState } from 'react'

interface VesselsTabContextValue {
   vesselsActivated: boolean
   setVesselsActivated: React.Dispatch<React.SetStateAction<boolean>>
}

const VesselsTabContext = createContext<VesselsTabContextValue | null>(null)

export function useVesselsTab(): VesselsTabContextValue {
   const context = useContext(VesselsTabContext)
   if (!context) {
      throw new Error('useVesselsTab must be used within a VesselsTabProvider')
   }
   return context
}

export function VesselsTabProvider({ children }: { children: ReactNode }) {
   const [vesselsActivated, setVesselsActivated] = useState<boolean>(false)

   const value: VesselsTabContextValue = {
      vesselsActivated: vesselsActivated,
      setVesselsActivated: setVesselsActivated,
   }

   return (
      <VesselsTabContext.Provider value={value}>
         {children}
      </VesselsTabContext.Provider>
   )
}
