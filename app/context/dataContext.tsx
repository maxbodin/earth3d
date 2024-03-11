import React, { createContext, ReactNode, useContext, useState } from 'react'
import { ObjectType } from '@/app/components/atoms/objectType'

interface DataContextValue {
   planesData: any
   setPlanesData: React.Dispatch<React.SetStateAction<any>>
   planeTrackData: any
   setPlaneTrackData: React.Dispatch<React.SetStateAction<any>>
   selectedObjectData: any
   setSelectedObjectData: React.Dispatch<React.SetStateAction<any>>
   selectedObjectType: ObjectType
   setSelectedObjectType: React.Dispatch<React.SetStateAction<any>>
}

// Create context.
const DataContext = createContext<DataContextValue | null>(null)

// Custom hook to access context.
export function useData() {
   const context = useContext(DataContext)
   if (!context) {
      throw new Error('useData must be used within a DataProvider')
   }
   return context
}

// Provider component.
export function DataProvider({ children }: { children: ReactNode }) {
   const [planesData, setPlanesData] = useState<any>(null)
   const [planeTrackData, setPlaneTrackData] = useState<any>(null)
   const [selectedObjectData, setSelectedObjectData] = useState({})
   const [selectedObjectType, setSelectedObjectType] = useState(ObjectType.NULL)

   const value: DataContextValue = {
      planesData,
      setPlanesData,
      planeTrackData,
      setPlaneTrackData,
      selectedObjectData,
      setSelectedObjectData,
      selectedObjectType,
      setSelectedObjectType,
   }

   return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
