import { useEffect } from 'react'
import { useData } from '@/app/context/dataContext'
import {
   processAndSaveMessages,
   startConnection,
} from '@/app/server/services/vesselDataService'

export function VesselDataFetch(): null {
   const { setVesselsData, vesselsData } = useData()

   useEffect(() => {
      const intervalId = setInterval((): void => {
         processAndSaveMessages()
            .then((response) => {
               setVesselsData(response)
            })
            .catch((error): void => {
               // TODO setError(error.message)
            })
      }, 1000)

      return (): void => {
         clearInterval(intervalId) // Clear interval on component unmount.
      }
   }, [setVesselsData])

   // TODO ACTIVATE USING BUTTON ON DASHBOARD
   startConnection()

   return null
}
