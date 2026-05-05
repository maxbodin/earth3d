import { useCallback, useState } from 'react'
import { Marker } from '@/app/types/marker'
import { CircleMarker } from '@/app/types/circleMarker'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import debounce from 'lodash/debounce'
import { Option } from '@/shadcn/ui/autocomplete'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { autocompleteORS, reverseORS } from '@/app/server/services/openRouteService'
import { PUCK_COLOR } from '@/app/constants/colors'
import {
   parseMarkerJson,
   ValidatedMarkerEntry,
   validateMarkerFile,
} from '@/app/components/organisms/markersDashboard/markerImportValidator'
import { haversineDistance } from '@/lib/geo/haversineDistance'
import { getRandomHighContrastColor } from '@/lib/color/getRandomHighContrastColor'
import { midpoint } from '@/lib/geo/midpoint'
import { DistanceMeasurement } from '@/app/types/distanceMeasurement'
import { createCircleMarker } from '@/lib/factories/circleMarkerFactory'
import { createMarker } from '@/lib/factories/markerFactory'

export function MarkersDashboardController() {
   const [selectedRows, setSelectedRows] = useState<Marker[]>([])
   const [featureSuggestions, setFeatureSuggestions] = useState<Feature[]>([])

   const [autoCompleteError, setAutoCompleteError] = useState<string>()
   const [autoCompleteLoading, setAutoCompleteLoading] =
      useState<boolean>(false)

   const { flyToCoordinates } = CameraFlyController()

   const { markers, setMarkers, setCircleMarkers, setDistanceMeasurement } = useMarkersDashboard()

   const computeDistanceBetweenMarkers = useCallback((selected: Marker[]): DistanceMeasurement | null => {
      if (selected.length !== 2) return null

      const [a, b] = selected

      if (!Number.isFinite(a.latitude) || !Number.isFinite(a.longitude)
         || !Number.isFinite(b.latitude) || !Number.isFinite(b.longitude)) {
         return null
      }

      const distanceKm = haversineDistance(a, b)
      const mid = midpoint(a, b)

      return {
         markerA: a,
         markerB: b,
         midpoint: mid,
         distanceKm,
         color: getRandomHighContrastColor(),
      }
   }, [])

   const measureDistance = useCallback((selected: Marker[]): DistanceMeasurement | null => {
      const measurement = computeDistanceBetweenMarkers(selected)
      setDistanceMeasurement(measurement)
      return measurement
   }, [computeDistanceBetweenMarkers, setDistanceMeasurement])

   const clearDistanceMeasurement = useCallback((): void => {
      setDistanceMeasurement(null)
   }, [setDistanceMeasurement])

   const clearSelectedRows = useCallback((): void => {
      setSelectedRows([])
   }, [])

   const createNewMarker = (): void => {
      setMarkers(prevMarkers => {
         return [...prevMarkers, createMarker({ latitude: 0, longitude: 0 })]
      })
   }

   const createNewCircleMarker = (): void => {
      setCircleMarkers(prevCircleMarkers => {
         return [...prevCircleMarkers, createCircleMarker()]
      })
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
               name: updatedRows[puckIndex].name.trim() === ''
                  ? 'Your position'
                  : updatedRows[puckIndex].name,
               latitude,
               longitude,
               color: PUCK_COLOR,
               isPuck: true,
            }
            return updatedRows
         }

         return [...prevMarkers, createMarker({
            name: 'Your position',
            latitude,
            longitude,
            color: PUCK_COLOR,
            isPuck: true,
         })]
      })
   }

   /**
    * 
    */
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

   /**
    * 
    */
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
         const isAlreadySelected = prevRows.some(row => row.id === marker.id)

         return isAlreadySelected
            ? prevRows.filter(row => row.id !== marker.id)
            : [...prevRows, marker]
      })
   }

   /**
    * 
    */
   const importMarkersFromFile = useCallback(async (file: File): Promise<string | null> => {
      const fileError = validateMarkerFile(file)
      if (fileError != null) return fileError

      const text = await file.text()
      const result = parseMarkerJson(text)

      if (!result.ok) return result.error

      const newMarkers: Marker[] = result.markers.map((entry: ValidatedMarkerEntry) =>
         createMarker({
            name: entry.name,
            address: entry.address,
            latitude: entry.latitude,
            longitude: entry.longitude,
            color: entry.color || undefined,
         }),
      )

      setMarkers(prev => [...prev, ...newMarkers])

      return null
   }, [setMarkers])

   /**
    * 
    * @returns 
    */
   const exportSelectedMarkers = (): void => {
      if (selectedRows.length === 0) return

      const latestSelected: Marker[] = markers.filter(
         marker => selectedRows.some(selected => selected.id === marker.id),
      )

      const exportData = latestSelected.map(({ name, address, latitude, longitude, color }) => ({
         name,
         address,
         latitude,
         longitude,
         color,
      }))

      const blob = new Blob(
         [JSON.stringify(exportData, null, 2)],
         { type: 'application/json' },
      )

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'markers.json'
      anchor.click()
      URL.revokeObjectURL(url)
   }

   const updateMarker = (index: number, newMaker: Marker): void => {
      setMarkers(markers => {
         const updatedRows = [...markers]
         updatedRows[index] = newMaker
         return updatedRows
      })
   }

   const updateCircleMarker = (index: number, newCircleMarker: CircleMarker): void => {
      setCircleMarkers(prevCircleMarkers => {
         const updatedRows = [...prevCircleMarkers]
         updatedRows[index] = newCircleMarker
         return updatedRows
      })
   }

   /**
    * Remove a given marker.
    * @param marker
    */
   const deleteMarker = (marker: Marker): void => {
      setMarkers(markers => {
         return markers.filter(existingMarker => existingMarker.id !== marker.id)
      })
   }

   /**
    * 
    * @param circleMarker 
    */
   const deleteCircleMarker = (circleMarker: CircleMarker): void => {
      setCircleMarkers(prevCircleMarkers => {
         return prevCircleMarkers.filter(existingCircleMarker => existingCircleMarker.id !== circleMarker.id)
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
      exportSelectedMarkers,
      importMarkersFromFile,
      createNewMarker,
      createNewCircleMarker,
      updatePuckMarker,
      updateMarker,
      updateCircleMarker,
      deleteMarker,
      deleteCircleMarker,
      featureSuggestions,
      autoCompleteLoading,
      autoCompleteError,
      onSelectionChange,
      onInputChange,
      onCoordsChange,
      fillPuckAddressIfMissing,
      measureDistance,
      clearDistanceMeasurement,
      clearSelectedRows,
   }
}
