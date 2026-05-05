import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { ObjectType } from '@/app/enums/objectType'
import { getRandomLandPlace } from '@/app/components/molecules/navigationBar/navigationBarRandomPlace'
import { Marker } from '@/app/types/marker'
import { createMarkerFromPlaceFeature } from '@/lib/factories/markerFactory'

interface UseRandomLandPlaceParams {
   flyToCoordinates: (latitude: number, longitude: number) => void
   setSelectedObjectData: Dispatch<SetStateAction<any>>
   setSelectedObjectType: Dispatch<SetStateAction<ObjectType>>
   setMarkers: Dispatch<SetStateAction<Marker[]>>
}

interface UseRandomLandPlaceResult {
   getRandomPlace: () => Promise<void>
   isRandomPlaceLoading: boolean
}

export function useRandomLandPlace({
                                       flyToCoordinates,
                                       setSelectedObjectData,
                                       setSelectedObjectType,
                                       setMarkers,
                                    }: UseRandomLandPlaceParams): UseRandomLandPlaceResult {
   const [isRandomPlaceLoading, setIsRandomPlaceLoading] = useState<boolean>(false)

   const getRandomPlace = useCallback(async (): Promise<void> => {
      if (isRandomPlaceLoading) return

      setIsRandomPlaceLoading(true)

      try {
         const randomPlace = await getRandomLandPlace()

         if (randomPlace == null) {
            console.warn('Unable to find a random land place after multiple attempts.')
            return
         }

         setSelectedObjectData(randomPlace.feature)
         setSelectedObjectType(ObjectType.PLACE)

         const marker = createMarkerFromPlaceFeature(randomPlace.feature)
         if (marker != null) {
            setMarkers(prevMarkers => [...prevMarkers, marker])
         }

         flyToCoordinates(randomPlace.coordinates.latitude, randomPlace.coordinates.longitude)
      } catch (error) {
         console.error('Failed to fetch a random land place.', error)
      } finally {
         setIsRandomPlaceLoading(false)
      }
   }, [flyToCoordinates, isRandomPlaceLoading, setMarkers, setSelectedObjectData, setSelectedObjectType])

   return {
      getRandomPlace,
      isRandomPlaceLoading,
   }
}
