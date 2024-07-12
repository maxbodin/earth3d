import { useCallback, useState } from 'react'
import { Marker } from '@/app/types/marker'
import { getRandomVibrantColor } from '@/app/lib/utils'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import debounce from 'lodash/debounce'
import { autocomplete, reverse } from '@/app/server/services/openRouteService'
import { Option } from '@/shadcn/ui/autocomplete'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'

export function MarkersDashboardController() {
   const [rows, setRows] = useState<Marker[]>([])
   const [selectedRows, setSelectedRows] = useState<Marker[]>([])
   const [featureSuggestions, setFeatureSuggestions] = useState<Feature[]>([])

   const [autoCompleteError, setAutoCompleteError] = useState<string>()
   const [autoCompleteLoading, setAutoCompleteLoading] =
      useState<boolean>(false)

   const { flyToCoordinates } = CameraFlyController()

   const generateUniqueId = (): string => {
      return `marker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
   }


   const createNewMarker = (): void => {
      setRows([...rows, {
         id: generateUniqueId(),
         selection: 'selection',
         name: '',
         address: '',
         latitude: 0,
         longitude: 0,
         color: getRandomVibrantColor(),
         actions: 'actions',
      }])
   }

   const selectMarker = (marker: Marker): void => {
      setSelectedRows(prevRows => {
         prevRows.push(marker)
         return prevRows
      })
   }

   const updateMarker = (index: number, newMaker: Marker): void => {
      setRows(prevRows => {
         const updatedRows = [...prevRows]
         updatedRows[index] = newMaker
         return updatedRows
      })
   }

   /**
    * Remove a given marker.
    * @param marker
    */
   const deleteMarker = (marker: Marker): void => {
      setRows(prevRows => {
         // Filter out the marker that matches the one to be removed.
         return prevRows.filter(existingMarker => existingMarker.id !== marker.id)
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

         // TODO Create marker on map.

         // Fly to new marker.
         flyToCoordinates(
            marker.latitude,
            marker.longitude,
         )

         setFeatureSuggestions([])
      }
   }

   return {
      rows,
      setRows,
      selectedRows,
      selectMarker,
      createNewMarker,
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
