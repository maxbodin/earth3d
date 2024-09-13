import React, { createContext, ReactNode, useContext, useState } from 'react'
import { ObjectType } from '@/app/enums/objectType'
import { CURSOR_MODE_DEFAULT, CursorModeType } from '@/app/enums/modeType'

interface SelectionContextValue {
   cursorMode: CursorModeType
   setCursorMode: React.Dispatch<React.SetStateAction<CursorModeType>>
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
   const [cursorMode, setCursorMode] = useState<CursorModeType>(CURSOR_MODE_DEFAULT)
   const [selectedObjectData, setSelectedObjectData] = useState([])
   const [selectedObjectType, setSelectedObjectType] = useState<ObjectType>(ObjectType.NULL)

   const value: SelectionContextValue = {
      cursorMode: cursorMode,
      setCursorMode: setCursorMode,
      selectedObjectData: selectedObjectData,
      setSelectedObjectData: setSelectedObjectData,
      selectedObjectType: selectedObjectType,
      setSelectedObjectType: setSelectedObjectType,
   }

   return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}
