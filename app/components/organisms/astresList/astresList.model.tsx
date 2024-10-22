'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'
import { astres } from '@/app/data/astres'
import { Astre } from '@/app/types/astre'
import { DateValue } from '@nextui-org/react'
import { parseDate } from '@internationalized/date'

interface AstresListContextValue {
   selectedAstre: Astre
   setSelectedAstre: React.Dispatch<React.SetStateAction<Astre>>
   selectedDate: DateValue,
   setSelectedDate: React.Dispatch<React.SetStateAction<DateValue>>
}

const AstresListContext = createContext<AstresListContextValue | null>(null)

export function useAstresList(): AstresListContextValue {
   const context = useContext(AstresListContext)
   if (!context) {
      throw new Error('useAstresList must be used within a AstresListProvider')
   }
   return context
}

export function AstresListProvider({ children }: { children: ReactNode }) {
   const [selectedAstre, setSelectedAstre] = useState<Astre>(astres[3])
   const [selectedDate, setSelectedDate] = useState<DateValue>(parseDate(new Date().toISOString().substring(0, 10)))

   const value: AstresListContextValue = {
      selectedAstre: selectedAstre,
      setSelectedAstre: setSelectedAstre,
      selectedDate: selectedDate,
      setSelectedDate: setSelectedDate,
   }

   return (
      <AstresListContext.Provider value={value}>
         {children}
      </AstresListContext.Provider>
   )
}
