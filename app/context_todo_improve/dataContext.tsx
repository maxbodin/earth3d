import React, { createContext, ReactNode, useContext, useState } from 'react'

interface DataContextValue {
   planesData: any
   setPlanesData: React.Dispatch<React.SetStateAction<any>>
   planeTrackData: any
   setPlaneTrackData: React.Dispatch<React.SetStateAction<any>>
}

const DataContext = createContext<DataContextValue | null>(null)

export function useData(): DataContextValue {
   const context = useContext(DataContext)
   if (!context) {
      throw new Error('useData must be used within a DataProvider')
   }
   return context
}

export function DataProvider({ children }: { children: ReactNode }) {
   const [planesData, setPlanesData] = useState<any>([])
   const [planeTrackData, setPlaneTrackData] = useState<any>([])

   const value: DataContextValue = {
      planesData,
      setPlanesData,
      planeTrackData,
      setPlaneTrackData,
   }

   return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
