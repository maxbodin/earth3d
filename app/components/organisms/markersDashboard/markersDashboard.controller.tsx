import { useCallback, useState } from 'react'
import { Marker } from '@/app/types/marker'
import { getRandomVibrantColor } from '@/app/lib/utils'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import debounce from 'lodash/debounce'
import { Option } from '@/shadcn/ui/autocomplete'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { autocompleteORS, reverseORS } from '@/app/server/services/openRouteService'
import { PUCK_COLOR } from '@/app/constants/colors'

export function MarkersDashboardController() {
   const [selectedRows, setSelectedRows] = useState<Marker[]>([])
   const [featureSuggestions, setFeatureSuggestions] = useState<Feature[]>([])

   const [autoCompleteError, setAutoCompleteError] = useState<string>()
   const [autoCompleteLoading, setAutoCompleteLoading] =
      useState<boolean>(false)

   const { flyToCoordinates } = CameraFlyController()

   const generateUniqueId = (): string => {
      return `marker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
   }

   const { markers, setMarkers } = useMarkersDashboard()

   const createNewMarker = (): void => {
      setMarkers(prevMarkers => {
         return [...prevMarkers, {
            id: generateUniqueId(),
            selection: 'selection',
            name: '',
            address: '',
            latitude: 0,
            longitude: 0,
            color: getRandomVibrantColor(),
            actions: 'actions',
            isPuck: false,
         }]
      })


      // TODO Create marker on map.
   }

   /**
    * Update or create puck marker.
    *
    * @param latitude
    * @param longitude
    */
   const updatePuckMarker = (latitude: number, longitude: number): void => {
      setMarkers(prevMarkers => {
         const puckIndex = prevMarkers.findIndex(marker => marker.isPuck)

         if (puckIndex !== -1) {
            const updatedRows = [...prevMarkers]
            updatedRows[puckIndex] = {
               ...updatedRows[puckIndex],
               latitude,
               longitude,
               color: PUCK_COLOR,
               isPuck: true,
            }
            return updatedRows
         }

         return [...prevMarkers, {
            id: generateUniqueId(),
            selection: 'selection',
            name: 'Your position',
            address: '',
            latitude,
            longitude,
            color: PUCK_COLOR,
            actions: 'actions',
            isPuck: true,
         }]
      })
   }

   const applyReverseGeocodingForMarker = useCallback(async (
      markerId: string,
      latitude: number,
      longitude: number,
   ): Promise<void> => {
      try {
         const data: GeocodeResponse = await reverseORS(longitude, latitude)
         const selectedSuggestion: Feature | undefined = data.features?.[0]

         if (selectedSuggestion == null) {
            return
         }

         setMarkers(prevMarkers => {
            return prevMarkers.map(marker => {
               if (marker.id !== markerId) {
                  return marker
               }

               return {
                  ...marker,
                  name: marker.name == ''
                     ? selectedSuggestion.properties.name
                     : marker.name,
                  address: selectedSuggestion.properties.label,
                  latitude: selectedSuggestion.geometry.coordinates[1],
                  longitude: selectedSuggestion.geometry.coordinates[0],
               }
            })
         })
      } catch (error) {
         setAutoCompleteError('Error fetching reverse geocode results.')
      }
   }, [setMarkers])

   const fillPuckAddressIfMissing = useCallback(async (): Promise<void> => {
      const puckMarker: Marker | undefined = markers.find(marker => marker.isPuck)

      if (puckMarker == null) return
      if (!Number.isFinite(puckMarker.latitude) || !Number.isFinite(puckMarker.longitude)) return
      if (puckMarker.address.trim() !== '') return

      await applyReverseGeocodingForMarker(
         puckMarker.id,
         puckMarker.latitude,
         puckMarker.longitude,
      )
   }, [markers, applyReverseGeocodingForMarker])


   const selectMarker = (marker: Marker): void => {
      setSelectedRows(prevRows => {
         prevRows.push(marker)
         return prevRows
      })
   }

   const updateMarker = (index: number, newMaker: Marker): void => {
      setMarkers(markers => {
         const updatedRows = [...markers]
         updatedRows[index] = newMaker
         return updatedRows
      })


      // TODO Update marker on map.
   }

   /**
    * Remove a given marker.
    * @param marker
    */
   const deleteMarker = (marker: Marker): void => {
      setMarkers(markers => {
         // Filter out the marker that matches the one to be removed.
         return markers.filter(existingMarker => existingMarker.id !== marker.id)
      })
   }

   /**
    *
    * @param value
    */
   const onInputChange = (value: string): void => {
      handleInputChange(value)
   }

   /**
    * Debounced function to handle input changes.
    */
   const handleInputChange = useCallback(
      debounce(async (value: string) => {

         if (value.trim() === '') {
            setFeatureSuggestions([])
            return
         }

         try {
            setAutoCompleteLoading(true)
            setAutoCompleteError('')

            // Call server-side function.
            const data: GeocodeResponse = await autocompleteORS(value)
            setFeatureSuggestions(data.features || [])
         } catch (err) {
            setAutoCompleteError('Error fetching autocomplete results.')
         } finally {
            setAutoCompleteLoading(false)
         }
      }, 300), // Throttle input to 300ms.
      [],
   )

   /**
    *
    * @param marker
    */
   const onCoordsChange = (marker: Marker): void => {
      if (!Number.isFinite(marker.latitude) || !Number.isFinite(marker.longitude)) {
         return
      }

      handleCoordsChange(marker.id, marker.latitude, marker.longitude)
   }

   /**
    * Debounced function to handle coordinates changes.
    */
   const handleCoordsChange = useCallback(
      debounce(async (markerId: string, latitude: number, longitude: number) => {
         await applyReverseGeocodingForMarker(markerId, latitude, longitude)
      }, 300), // Throttle input to 300ms.
      [applyReverseGeocodingForMarker],
   )

   /**
    *
    * @param option
    * @param marker
    */
   const onSelectionChange = (option: Option, marker: Marker): void => {
      const selectedSuggestion: Feature | undefined =
         featureSuggestions.find(
            (suggestion: Feature): boolean =>
               suggestion.properties?.id === option.value,
         )

      if (selectedSuggestion) {
         const latitude: number = selectedSuggestion.geometry.coordinates[1]
         const longitude: number = selectedSuggestion.geometry.coordinates[0]

         setMarkers(prevMarkers => {
            return prevMarkers.map(existingMarker => {
               if (existingMarker.id !== marker.id) {
                  return existingMarker
               }

               return {
                  ...existingMarker,
                  name: existingMarker.name == ''
                     ? selectedSuggestion.properties.name
                     : existingMarker.name,
                  address: selectedSuggestion.properties.label,
                  latitude,
                  longitude,
               }
            })
         })

         // Fly to new marker.
         flyToCoordinates(
            latitude,
            longitude,
         )

         setFeatureSuggestions([])
      }
   }

   return {
      selectedRows,
      selectMarker,
      createNewMarker,
      updatePuckMarker,
      updateMarker,
      deleteMarker,
      featureSuggestions,
      autoCompleteLoading,
      autoCompleteError,
      onSelectionChange,
      onInputChange,
      onCoordsChange,
      fillPuckAddressIfMissing,
   }
}
