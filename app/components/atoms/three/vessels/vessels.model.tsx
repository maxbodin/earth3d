import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'

interface VesselsContextValue {
   // TODO : Add type.
   vesselsRawData: any[]
   setVesselsRawData: React.Dispatch<React.SetStateAction<any[]>>
   displayedVesselsGroup: Set<THREE.Group>
   setDisplayedVesselsGroup: React.Dispatch<React.SetStateAction<Set<THREE.Group>>>
}

const VesselsContext = createContext<VesselsContextValue | null>(null)

export function useVessels(): VesselsContextValue {
   const context = useContext(VesselsContext)
   if (!context) {
      throw new Error('useVessels must be used within a VesselsProvider')
   }
   return context
}

export function VesselsProvider({ children }: { children: ReactNode }) {
   // TODO : Add type.
   const [vesselsRawData, setVesselsRawData] = useState<any[]>([])
   const [displayedVesselsGroup, setDisplayedVesselsGroup] =
      useState<Set<THREE.Group>>(new Set<THREE.Group>())

   const value: VesselsContextValue = {
      displayedVesselsGroup: displayedVesselsGroup,
      setDisplayedVesselsGroup: setDisplayedVesselsGroup,
      vesselsRawData: vesselsRawData,
      setVesselsRawData: setVesselsRawData,
   }

   return (
      <VesselsContext.Provider value={value}>
         {children}
      </VesselsContext.Provider>
   )
}
