import React, { createContext, ReactNode, useContext, useState } from 'react'

interface VisibleZoneContextValue {
   sphereVisibleZone: {
      bottomLatLon: { lat: number; lon: number }
      leftLatLon: { lat: number; lon: number }
      topLatLon: { lat: number; lon: number }
      rightLatLon: { lat: number; lon: number }
   }
   setSphereVisibleZone: React.Dispatch<React.SetStateAction<any>>
}

// Create context.
const VisibleZoneContext = createContext<VisibleZoneContextValue | null>(null)

// Custom hook to access context.
export function useVisibleZone(): VisibleZoneContextValue {
   const context = useContext(VisibleZoneContext)
   if (!context) {
      throw new Error(
         'useVisibleZone must be used within a VisibleZoneProvider'
      )
   }
   return context
}

// Provider component.
export function VisibleZoneProvider({ children }: { children: ReactNode }) {
   const [sphereVisibleZone, setSphereVisibleZone] = useState<{
      bottomLatLon: { lat: 0; lon: 0 }
      leftLatLon: { lat: 0; lon: 0 }
      topLatLon: { lat: 0; lon: 0 }
      rightLatLon: { lat: 0; lon: 0 }
   }>({
      bottomLatLon: { lat: 0, lon: 0 },
      leftLatLon: { lat: 0, lon: 0 },
      topLatLon: { lat: 0, lon: 0 },
      rightLatLon: { lat: 0, lon: 0 },
   })

   const value: VisibleZoneContextValue = {
      sphereVisibleZone,
      setSphereVisibleZone,
   }

   return (
      <VisibleZoneContext.Provider value={value}>
         {children}
      </VisibleZoneContext.Provider>
   )
}
