'use client'
import { useEffect, useState } from 'react'
import { MarkersDashboardController } from '@/app/components/organisms/markersDashboard/markersDashboard.controller'

export const Geolocation = (): null => {
   const [location, setLocation] = useState<GeolocationPosition>()
   const [, setError] = useState<string>()

   const {
      updatePuckMarker,
   } = MarkersDashboardController()

   /**
    *
    * @param position
    */
   const successCallback = (position: GeolocationPosition): void => {
      setLocation(position)
   }

   /**
    *
    * @param error
    */
   const errorCallback = (error: any): void => {
      switch (error.code) {
         case error.PERMISSION_DENIED:
            setError('User denied the request for Geolocation.')
            break
         case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
         case error.TIMEOUT:
            setError('The request to get user location timed out.')
            break
         default:
            setError('An unknown error occurred.')
            break
      }
   }

   useEffect(() => {
      if (!navigator.geolocation) {
         setError('Geolocation is not supported by your browser.')
         return
      }

      navigator.geolocation.getCurrentPosition(successCallback, errorCallback)

      const watchId: number = navigator.geolocation.watchPosition(
         successCallback,
         errorCallback,
         {
            enableHighAccuracy: true, // Use high accuracy if available.
            maximumAge: 10000, // Reuse position if last fetched within this time (ms)
            timeout: 5000, // Time out after this time (ms)
         },
      )

      // Clean up the watcher on component unmount.
      return (): void => {
         navigator.geolocation.clearWatch(watchId)
      }
   }, [])

   useEffect(() => {
      if (location != null) {
         const { latitude, longitude } = location.coords
         updatePuckMarker(latitude, longitude)
      }
   }, [location])

   return null
}

