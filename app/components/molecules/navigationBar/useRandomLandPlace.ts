import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { ObjectType } from '@/app/enums/objectType'
import { getRandomLandPlace } from '@/app/components/molecules/navigationBar/navigationBarRandomPlace'

interface UseRandomLandPlaceParams {
   flyToCoordinates: (latitude: number, longitude: number) => void
   setSelectedObjectData: Dispatch<SetStateAction<any>>
   setSelectedObjectType: Dispatch<SetStateAction<ObjectType>>
}

interface UseRandomLandPlaceResult {
   getRandomPlace: () => Promise<void>
   isRandomPlaceLoading: boolean
}

export function useRandomLandPlace({
                                       flyToCoordinates,
                                       setSelectedObjectData,
                                       setSelectedObjectType,
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
         flyToCoordinates(randomPlace.coordinates.latitude, randomPlace.coordinates.longitude)
      } catch (error) {
         console.error('Failed to fetch a random land place.', error)
      } finally {
         setIsRandomPlaceLoading(false)
      }
   }, [flyToCoordinates, isRandomPlaceLoading, setSelectedObjectData, setSelectedObjectType])

   return {
      getRandomPlace,
      isRandomPlaceLoading,
   }
}
