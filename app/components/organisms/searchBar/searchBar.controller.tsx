import { KeyboardEvent, useCallback, useState } from 'react'
import countriesCoords from '@/app/data/country-codes-lat-long-alpha3.json'
import debounce from 'lodash/debounce'
import { SearchSubjectType } from '@/app/enums/SearchSubjectType'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import { autocompleteORS } from '@/app/server/services/openRouteService'
import { Country } from '@/app/types/countryType'
import { Selection } from '@nextui-org/react'
import { useSearchBar } from '@/app/components/organisms/searchBar/searchBar.model'
import { Key } from '@react-types/shared'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { updateCoordinatesInCurrentUrl } from '@/app/lib/coordinatesSearchParams'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { ObjectType } from '@/app/enums/objectType'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { createMarkerFromPlaceFeature } from '@/app/lib/markerFactory'

const PLACE_SEARCH_ZOOM_MULTIPLIER = 0.12
const PLACE_SEARCH_PLANISPHERE_ZOOM_MULTIPLIER = 0.01

export function SearchBarController() {
   const [searchTerm, setSearchTerm] = useState<string>('')

   const [featureSuggestions, setFeatureSuggestions] = useState<Feature[]>([])
   const [countrySuggestions, setCountrySuggestions] = useState<Country[]>([])

   const defaultErrorMessage = 'Please provide a valid input.'
   const [errorMessage, setErrorMessage] = useState<string>(defaultErrorMessage)
   const [isInvalid, setIsInvalid] = useState<boolean>(false)

   const [inputLabel, setInputLabel] = useState<string>('Country Name')

   const [autoCompleteError, setAutoCompleteError] = useState<string>()
   const [autoCompleteLoading, setAutoCompleteLoading] =
      useState<boolean>(false)

   const { selectedSubject, setSelectedSubject } = useSearchBar()
   const { setSelectedObjectData, setSelectedObjectType } = useSelection()
   const { setMarkers } = useMarkersDashboard()
   const { displayedSceneData } = useScenes()

   const { flyToCountryPos, flyToCoordinates } = CameraFlyController()

   const addMarkerFromPlace = useCallback((selectedSuggestion: Feature): void => {
      const marker = createMarkerFromPlaceFeature(selectedSuggestion)
      if (marker == null) {
         return
      }

      setMarkers(prevMarkers => {
         return [...prevMarkers, marker]
      })
   }, [setMarkers])

   const focusOnPlaceSuggestion = useCallback((selectedSuggestion: Feature): void => {
      const latitude = selectedSuggestion.geometry.coordinates[1]
      const longitude = selectedSuggestion.geometry.coordinates[0]

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
         setErrorMessage('Invalid place coordinates.')
         setIsInvalid(true)
         return
      }

      setSearchTerm(selectedSuggestion.properties.label)
      setFeatureSuggestions([])

      setSelectedObjectData(selectedSuggestion)
      setSelectedObjectType(ObjectType.PLACE)
      updateCoordinatesInCurrentUrl(latitude, longitude)

      addMarkerFromPlace(selectedSuggestion)

      const zoomMultiplier = displayedSceneData?.type === SceneType.PLANE
         ? PLACE_SEARCH_PLANISPHERE_ZOOM_MULTIPLIER
         : PLACE_SEARCH_ZOOM_MULTIPLIER

      flyToCoordinates(latitude, longitude, {
         zoomMultiplier,
      })
   }, [
      addMarkerFromPlace,
      displayedSceneData?.type,
      flyToCoordinates,
      setSelectedObjectData,
      setSelectedObjectType,
   ])

   const selectFirstPlaceSuggestion = useCallback(async (): Promise<void> => {
      if (selectedSubject !== SearchSubjectType.PLACE) {
         return
      }

      let firstSuggestion: Feature | undefined = featureSuggestions[0]

      if (firstSuggestion == null && searchTerm.trim() !== '') {
         try {
            const data: GeocodeResponse = await autocompleteORS(searchTerm)
            const refreshedSuggestions = data.features || []
            setFeatureSuggestions(refreshedSuggestions)
            firstSuggestion = refreshedSuggestions[0]
         } catch (error) {
            setAutoCompleteError('Error fetching autocomplete results.')
            return
         }
      }

      if (firstSuggestion == null) {
         setErrorMessage('No place found for this search.')
         setIsInvalid(true)
         return
      }

      setIsInvalid(false)
      focusOnPlaceSuggestion(firstSuggestion)
   }, [featureSuggestions, focusOnPlaceSuggestion, searchTerm, selectedSubject])

   /**
    * Debounced function to handle input changes.
    */
   const handleInputChange = useCallback(
      debounce(async (value: string) => {
         if (value.trim() === '') {
            setFeatureSuggestions([])
            setCountrySuggestions([])
            return
         }

         try {
            setAutoCompleteLoading(true)
            setAutoCompleteError('')

            if (selectedSubject === SearchSubjectType.PLACE) {
               // Call server-side function.
               const data: GeocodeResponse = await autocompleteORS(value)
               setFeatureSuggestions(data.features || [])

            } else if (selectedSubject === SearchSubjectType.COUNTRY) {
               // Filter countries based on input value.
               const filteredCountries =
                  countriesCoords.ref_country_codes.filter((country: Country) =>
                     country.country
                        .toLowerCase()
                        .startsWith(value.toLowerCase()),
                  )

               setCountrySuggestions(filteredCountries || [])
            }
         } catch (err) {
            setAutoCompleteError('Error fetching autocompleteORS results.')
         } finally {
            setAutoCompleteLoading(false)
         }
      }, 500),
      [selectedSubject],
   )

   /**
    *
    * @param value
    */
   const onInputChange = (value: string): void => {
      resetSelection()
      setSearchTerm(value)
      handleInputChange(value)
   }

   const onSearchInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key !== 'Enter') {
         return
      }

      if (selectedSubject !== SearchSubjectType.PLACE) {
         return
      }

      event.preventDefault()
      void selectFirstPlaceSuggestion()
   }

   /**
    *
    */
   const resetSelection = (): void => {
      setIsInvalid(false)
      setErrorMessage(defaultErrorMessage)
      setSearchTerm('')
   }

   /**
    *
    * @param key
    */
   const onSelectionChange = (key: Key | null): void => {
      switch (selectedSubject) {
         case SearchSubjectType.PLANE:
            break
         case SearchSubjectType.COUNTRY:
            if (flyToCountryPos(key as string)) {
               setIsInvalid(false)
            } else {
               setErrorMessage('Invalid Country Name.')
               setIsInvalid(true)
            }
            setCountrySuggestions([])
            break
         case SearchSubjectType.PLACE:
            const selectedSuggestion: Feature | undefined =
               featureSuggestions.find(
                  (suggestion: Feature): boolean =>
                     suggestion.properties?.id === key,
               )

            if (selectedSuggestion) {
               setIsInvalid(false)
               focusOnPlaceSuggestion(selectedSuggestion)
            }
            break
         case SearchSubjectType.VESSEL:
            break
         default:
            break
      }
   }

   /**
    *
    * @param keys
    */
   const onSubjectSelected = (keys: Selection): void => {
      resetSelection()

      const selectedKey: SearchSubjectType = Array.from(
         keys,
      )[0] as string as SearchSubjectType
      setSelectedSubject(selectedKey)

      switch (selectedKey) {
         case SearchSubjectType.PLANE:
            setInputLabel('Plane Name')
            break
         case SearchSubjectType.COUNTRY:
            setInputLabel('Country Name')
            break
         case SearchSubjectType.PLACE:
            setInputLabel('Place Name')
            break
         case SearchSubjectType.VESSEL:
            setInputLabel('Vessel Name')
            break
         default:
            break
      }
   }

   return {
      autoCompleteError,
      autoCompleteLoading,
      isInvalid,
      errorMessage,
      handleInputChange,
      selectedSubject,
      inputLabel,
      searchTerm,
      featureSuggestions,
      countrySuggestions,
      onSubjectSelected,
      onInputChange,
      onSelectionChange,
      onSearchInputKeyDown,
   }
}
