import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as THREE from 'three'

interface VesselsContextValue {
   displayedVesselsGroup: THREE.Group
   setDisplayedVesselsGroup: React.Dispatch<React.SetStateAction<any>>
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
   const [displayedVesselsGroup, setDisplayedVesselsGroup] =
      useState<THREE.Group>(new THREE.Group())

   const value: VesselsContextValue = {
      displayedVesselsGroup: displayedVesselsGroup,
      setDisplayedVesselsGroup: setDisplayedVesselsGroup,
   }

   return (
      <VesselsContext.Provider value={value}>
         {children}
      </VesselsContext.Provider>
   )
}
