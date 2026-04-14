import { useEffect, useState } from 'react'
import { fetchGeoPhotos } from '@/app/server/services/flickrService'

const PLACE_IMAGES_DEBOUNCE_MS = 250
const PLACE_IMAGES_LIMIT = 32

interface UsePlaceImagesResult {
   imageUrls: string[]
   imagesLoading: boolean
}

export function usePlaceImages(
   latitude: number,
   longitude: number,
   enabled: boolean,
): UsePlaceImagesResult {
   const [imageUrls, setImageUrls] = useState<string[]>([])
   const [imagesLoading, setImagesLoading] = useState<boolean>(false)

   useEffect(() => {
      if (!enabled) {
         setImageUrls([])
         setImagesLoading(false)
         return
      }

      let isCancelled = false
      const debounceTimeout = window.setTimeout(async (): Promise<void> => {
         try {
            setImagesLoading(true)
            const newImageUrls = await fetchGeoPhotos(latitude, longitude)
            if (isCancelled) return

            setImageUrls(Array.isArray(newImageUrls) ? newImageUrls.slice(0, PLACE_IMAGES_LIMIT) : [])
         } catch {
            if (isCancelled) return
            setImageUrls([])
         } finally {
            if (!isCancelled) {
               setImagesLoading(false)
            }
         }
      }, PLACE_IMAGES_DEBOUNCE_MS)

      return (): void => {
         isCancelled = true
         window.clearTimeout(debounceTimeout)
      }
   }, [enabled, latitude, longitude])

   return {
      imageUrls,
      imagesLoading,
   }
}
