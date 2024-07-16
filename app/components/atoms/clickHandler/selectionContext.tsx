import React, { createContext, ReactNode, useContext, useState } from 'react'
import { ObjectType } from '@/app/enums/objectType'

interface SelectionContextValue {
   selectedObjectData: any
   setSelectedObjectData: React.Dispatch<React.SetStateAction<any>>
   selectedObjectType: ObjectType
   setSelectedObjectType: React.Dispatch<React.SetStateAction<ObjectType>>
}

const SelectionContext = createContext<SelectionContextValue | null>(null)

export function useSelection(): SelectionContextValue {
   const context = useContext(SelectionContext)
   if (!context) {
      throw new Error('useSelection must be used within a SelectionProvider')
   }
   return context
}

export function SelectionProvider({ children }: { children: ReactNode }) {
   const [selectedObjectData, setSelectedObjectData] = useState([])
   const [selectedObjectType, setSelectedObjectType] = useState(ObjectType.NULL)

   const value: SelectionContextValue = {
      selectedObjectData,
      setSelectedObjectData,
      selectedObjectType,
      setSelectedObjectType,
   }

   return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}
