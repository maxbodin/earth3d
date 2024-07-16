import { useCallback, useState } from 'react'
import { Marker } from '@/app/types/marker'
import { getRandomVibrantColor } from '@/app/lib/utils'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import debounce from 'lodash/debounce'
import { autocomplete, reverse } from '@/app/server/services/openRouteService'
import { Option } from '@/shadcn/ui/autocomplete'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'

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
      setMarkers([...markers, {
         id: generateUniqueId(),
         selection: 'selection',
         name: '',
         address: '',
         latitude: 0,
         longitude: 0,
         color: getRandomVibrantColor(),
         actions: 'actions',
         isPuck: false,
      }])


      // TODO Create marker on map.
   }

   /**
    * Update or create puck marker.
    *
    * @param latitude
    * @param longitude
    */
   const updatePuckMarker = (latitude: number, longitude: number): void => {
      // Find the index of the existing puck marker.
      const puckIndex: number = markers.findIndex(marker => marker.isPuck)

      console.log(markers)
      // If it exists, update its latitude and longitude.
      if (puckIndex !== -1) {
         const updatedRows = [...markers]
         updatedRows[puckIndex] = {
            ...updatedRows[puckIndex],
            latitude,
            longitude,
         }
         setMarkers(updatedRows)
      } else {
         // If no puck marker exists, create a new one.
         setMarkers([...markers, {
            id: generateUniqueId(),
            selection: 'selection',
            name: 'Your position',
            address: '',
            latitude,
            longitude,
            color: getRandomVibrantColor(),
            actions: 'actions',
            isPuck: true,
         }])
      }
   }


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
            const data: GeocodeResponse = await autocomplete(value)
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
      console.log(`Called with latitude = ${marker.latitude}, longitude = ${marker.longitude}`)
      if (marker.latitude != null && marker.latitude != 0 && marker.longitude != null && marker.longitude != 0)
         handleCoordsChange(marker)
   }

   /**
    * Debounced function to handle coordinates changes.
    */
   const handleCoordsChange = useCallback(
      debounce(async (marker: Marker) => {
         try {
            // Call server-side function.
            const data: GeocodeResponse = await reverse(marker.latitude, marker.longitude)

            const selectedSuggestion: Feature = data.features[0]

            if (marker.name == '') marker.name = selectedSuggestion.properties.name
            marker.address = selectedSuggestion.properties.label
            marker.latitude = selectedSuggestion.geometry.coordinates[1]
            marker.longitude = selectedSuggestion.geometry.coordinates[0]

            // TODO console.log(marker);
            // TODO FIX ADDRESS NOT UPDATED
         } catch (err) {
            marker.latitude = 0
            marker.longitude = 0
         }
      }, 300), // Throttle input to 300ms.
      [],
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
         if (marker.name == '') marker.name = selectedSuggestion.properties.name
         marker.address = selectedSuggestion.properties.label
         marker.latitude = selectedSuggestion.geometry.coordinates[1]
         marker.longitude = selectedSuggestion.geometry.coordinates[0]

         // Fly to new marker.
         flyToCoordinates(
            marker.latitude,
            marker.longitude,
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
   }
}
