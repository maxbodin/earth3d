import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Volcano } from '@/app/types/volcano/volcano'

interface VolcanoesContextValue {
   displayedVolcanoesGroup: THREE.Group
   volcanoData: Volcano[]
   setVolcanoData: React.Dispatch<React.SetStateAction<Volcano[]>>
   selectedVolcano: Volcano | null
   setSelectedVolcano: React.Dispatch<React.SetStateAction<Volcano | null>>
}

const VolcanoesContext = createContext<VolcanoesContextValue | null>(null)

export function useVolcanoes(): VolcanoesContextValue {
   const context = useContext(VolcanoesContext)
   if (!context) {
      throw new Error('useVolcanoes must be used within a VolcanoesProvider')
   }
   return context
}

export function VolcanoesProvider({ children }: { children: ReactNode }) {
   const displayedVolcanoesGroupRef = useRef<THREE.Group>(new THREE.Group())
   const [volcanoData, setVolcanoData] = useState<Volcano[]>([])
   const [selectedVolcano, setSelectedVolcano] = useState<Volcano | null>(null)

   const value: VolcanoesContextValue = useMemo(
      () => ({
         displayedVolcanoesGroup: displayedVolcanoesGroupRef.current,
         volcanoData,
         setVolcanoData,
         selectedVolcano,
         setSelectedVolcano,
      }),
      [volcanoData, selectedVolcano],
   )

   return (
      <VolcanoesContext.Provider value={value}>
         {children}
      </VolcanoesContext.Provider>
   )
}
