import { useEffect } from 'react'
import {
   fetchPlanesData,
   fetchPlaneTrackData,
} from '@/app/server/services/planeDataService'
import { useData } from '@/app/context/dataContext'

export function PlaneDataFetch(): null {
   const { setPlanesData } = useData()

   useEffect((): void => {
      fetchPlanesData()
         .then((jsonData): void => {
            setPlanesData(jsonData.states || [])
         })
         .catch((error): void => {
            // TODO setError(error.message)
         })
   }, [setPlanesData])

   return null
}

export const onPlaneSelected = (data: Record<string, any>): void => {
   const { setPlaneTrackData, setSelectedObjectData } = useData()

   setSelectedObjectData(data)

   fetchPlaneTrackData(data.data[0])
      .then((jsonData): void => {
         const pathData = jsonData.path
         setPlaneTrackData(pathData)
      })
      .catch((error): void => {
         // TODO setError(error.message)
      })
}
