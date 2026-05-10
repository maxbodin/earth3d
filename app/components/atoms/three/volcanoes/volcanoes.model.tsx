import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Eruption } from '@/app/types/volcano/eruption'
import { Volcano } from '@/app/types/volcano/volcano'

interface VolcanoesContextValue {
   displayedVolcanoesGroup: THREE.Group
   eruptionData: Eruption[]
   selectedVolcano: Volcano | null
   setEruptionData: React.Dispatch<React.SetStateAction<Eruption[]>>
   setSelectedVolcano: React.Dispatch<React.SetStateAction<Volcano | null>>
   setVolcanoData: React.Dispatch<React.SetStateAction<Volcano[]>>
   volcanoData: Volcano[]
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
   const [eruptionData, setEruptionData] = useState<Eruption[]>([])
   const [volcanoData, setVolcanoData] = useState<Volcano[]>([])
   const [selectedVolcano, setSelectedVolcano] = useState<Volcano | null>(null)

   const value: VolcanoesContextValue = useMemo(
      () => ({
         displayedVolcanoesGroup: displayedVolcanoesGroupRef.current,
         eruptionData,
         selectedVolcano,
         setEruptionData,
         setSelectedVolcano,
         setVolcanoData,
         volcanoData,
      }),
      [eruptionData, volcanoData, selectedVolcano],
   )

   return (
      <VolcanoesContext.Provider value={value}>
         {children}
      </VolcanoesContext.Provider>
   )
}
