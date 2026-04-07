import { useEffect } from 'react'
import { processAndSaveMessages } from '@/app/server/services/vesselDataService'
import { useVessels } from '@/app/components/atoms/three/vessels/vessels.model'

export function VesselDataFetch(): null {
   const { setVesselsRawData } = useVessels()

   useEffect(() => {
      const intervalId = setInterval((): void => {
         processAndSaveMessages()
            .then((response): void => {
               setVesselsRawData(response ?? [])
            })
            .catch((error): void => {
               // TODO setError(error.message)
            })
      }, 1000)

      return (): void => {
         clearInterval(intervalId) // Clear interval on component unmount.
      }
   }, [setVesselsRawData])

   return null
}
