import React, { useCallback, useEffect, useState } from 'react'
import { N_A_VALUE } from '@/app/constants/strings'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { Button } from '@nextui-org/react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { EyeIcon } from '@nextui-org/shared-icons'
import { Feature, FeatureProperties } from '@/app/types/orsTypes'
import { fetchGeoPhotos } from '@/app/server/services/flickrService'
import debounce from 'lodash/debounce'

export function PlaceDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()

   const { flyToCoordinates } = CameraFlyController()

   const data: Feature = selectedObjectData as Feature

   if (data == null) {
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )
   }

   const properties: FeatureProperties = data.properties
   const name: string = properties.name?.toString() || N_A_VALUE
   const label: string = properties.label?.toString() || N_A_VALUE
   const continent: string = properties.continent?.toString() || N_A_VALUE
   const country: string = properties.country?.toString() || N_A_VALUE
   const country_a: string = properties.country_a?.toString() || N_A_VALUE
   const county: string = properties.county?.toString() || N_A_VALUE
   const county_a: string = properties.county_a?.toString() || N_A_VALUE
   const region: string = properties.region?.toString() || N_A_VALUE

   const latitude: number = data.geometry.coordinates[1]
   const longitude: number = data.geometry.coordinates[0]
   const strLatitude: string = latitude.toFixed(3).toString() || N_A_VALUE
   const strLongitude: string = longitude.toFixed(3).toString() || N_A_VALUE

   const [imageUrls, setImageUrls] = useState<string[]>([])
   const [imagesLoading, setImagesLoading] = useState<boolean>(true)

   useEffect((): void => {
      getPlacesImages()
   }, [latitude, longitude])

   const getPlacesImages = useCallback(
      debounce(async () => {
         setImagesLoading(true)
         const newImageUrls = await fetchGeoPhotos(latitude, longitude)

         if (newImageUrls) {
            // Update state with the new image URLs.
            setImageUrls(newImageUrls)
         }

         setImagesLoading(false)
      }, 300), // Throttle input to 300ms.
      [latitude, longitude],
   )

   return (
      <div>
         {name != N_A_VALUE && (
            <h2 className="text-white text-2xl font-bold mb-2">
               Name: {name}{' '}
            </h2>
         )}
         {label != N_A_VALUE && (
            <h2 className="text-white text-xl font-bold mb-2">
               Label: {label}{' '}
            </h2>
         )}
         {continent != N_A_VALUE && (
            <h2 className="text-white text-l font-bold mb-2">
               Continent: {continent}{' '}
            </h2>
         )}
         {country != N_A_VALUE && (
            <h2 className="text-white text-l font-bold mb-2">
               Country: {country}{' '}{country_a}
            </h2>
         )}
         {county != N_A_VALUE && (
            <h2 className="text-white text-l font-bold mb-2">
               County: {county}{' '}{county_a}
            </h2>
         )}
         {region != N_A_VALUE && (
            <h2 className="text-white text-l font-bold mb-2">
               Region: {region}{' '}
            </h2>
         )}
         <div className="mb-2">
            <p className="text-gray-300">
               Longitude: {strLongitude}
            </p>
            <p className="text-gray-300">
               Latitude: {strLatitude}
            </p>
         </div>
         {
            // Fallback for N/A values here:
         }
         {name == N_A_VALUE && (
            <h2 className="text-gray-400 text-xl font-bold mb-2">
               Name: {name}{' '}
            </h2>
         )}
         {label == N_A_VALUE && (
            <h2 className="text-gray-400 text-l font-bold mb-2">
               Label: {label}{' '}
            </h2>
         )}
         {continent == N_A_VALUE && (
            <h2 className="text-gray-400 text-l font-bold mb-2">
               Continent: {continent}{' '}
            </h2>
         )}
         {country == N_A_VALUE && (
            <h2 className="text-gray-400 text-l font-bold mb-2">
               Country: {country}{' '}{country_a}
            </h2>
         )}
         {county == N_A_VALUE && (
            <h2 className="text-gray-400 text-l font-bold mb-2">
               County: {county}{' '}{county_a}
            </h2>
         )}
         {region == N_A_VALUE && (
            <h2 className="text-gray-400 text-l font-bold mb-2">
               Region: {region}{' '}
            </h2>
         )}
         <div className="mb-2 mt-2">
            {strLongitude == N_A_VALUE && (
               <p className="text-gray-400">Longitude: {longitude}</p>
            )}{' '}
            {strLatitude == N_A_VALUE && (
               <p className="text-gray-400">Latitude: {latitude}</p>
            )}
         </div>
         {
            // Images carousel :
         }
         <div>
            <h1 className="text-l font-bold mb-2">Images</h1>
            <div className="overflow-x-auto whitespace-nowrap">
               <div className="flex space-x-4">
                  {imagesLoading ? (
                     <p className="text-gray-400 text-l mb-2">Loading images...</p>
                  ) : imageUrls.length > 0 ? (
                     <>
                        {imageUrls.map((url: string, index: number) => (
                           <div key={index} className="flex-shrink-0 w-48 h-48">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                 src={url}
                                 alt={`Image ${index + 1}`}
                                 className="w-full h-full object-cover"
                              />
                           </div>
                        ))}
                     </>
                  ) : (
                     <p className="text-gray-400 text-l mb-2">No images found.</p>
                  )}
               </div>
            </div>
         </div>

         {latitude && longitude && <Button
            variant="bordered"
            size="sm"
            aria-label="Focus view on vessel"
            className="z-50 bg-black bg-opacity-50"
            endContent={<EyeIcon />}
            onClick={(): void => {
               flyToCoordinates(longitude, latitude)
            }}>
            Focus view on place
         </Button>}
      </div>
   )
}
