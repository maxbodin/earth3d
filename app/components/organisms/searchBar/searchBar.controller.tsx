import { KeyboardEvent, useCallback, useEffect, useState } from 'react'
import debounce from 'lodash/debounce'
import { SearchSubjectType } from '@/app/enums/SearchSubjectType'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import { autocompleteORS } from '@/app/server/services/openRouteService'
import { Country } from '@/app/types/countryType'
import { Selection } from '@nextui-org/react'
import { useSearchBar } from '@/app/components/organisms/searchBar/searchBar.model'
import { Key } from '@react-types/shared'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import {
   clearCoordinatesFromCurrentUrl,
   clearCountryFromCurrentUrl,
   updateCoordinatesInCurrentUrl,
   updateCountryInCurrentUrl,
} from '@/app/lib/coordinatesSearchParams'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { ObjectType } from '@/app/enums/objectType'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { createMarkerFromPlaceFeature } from '@/app/lib/markerFactory'
import { searchAirports } from '@/app/lib/airportSearch'
import { AirportSearchSuggestion } from '@/app/types/airport'
import { useCountries } from '@/app/components/atoms/three/countries/countries.model'
import {
   filterCountriesByPrefix,
   findCountryByName,
} from '@/app/lib/countrySearch'

const PLACE_SEARCH_ZOOM_MULTIPLIER = 0.12
const PLACE_SEARCH_PLANISPHERE_ZOOM_MULTIPLIER = 0.01
const AIRPORT_SEARCH_ZOOM_MULTIPLIER = 0.12
const AIRPORT_SEARCH_PLANISPHERE_ZOOM_MULTIPLIER = 0.01

export function SearchBarController() {
   const [searchTerm, setSearchTerm] = useState<string>('')

   const [featureSuggestions, setFeatureSuggestions] = useState<Feature[]>([])
   const [countrySuggestions, setCountrySuggestions] = useState<Country[]>([])
   const [airportSuggestions, setAirportSuggestions] = useState<AirportSearchSuggestion[]>([])

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
   const { selectedCountry, setSelectedCountry } = useCountries()

   const { flyToCoordinates } = CameraFlyController()

   useEffect((): void => {
      if (selectedSubject !== SearchSubjectType.COUNTRY) {
         return
      }

      const normalizedSelectedCountry = selectedCountry.trim()
      if (normalizedSelectedCountry.length === 0) {
         return
      }

      setSearchTerm((previousSearchTerm: string): string => {
         return previousSearchTerm === normalizedSelectedCountry
            ? previousSearchTerm
            : normalizedSelectedCountry
      })
   }, [selectedCountry, selectedSubject])

   const focusOnCountrySuggestion = useCallback((selectedCountrySuggestion: Country): void => {
      setSearchTerm(selectedCountrySuggestion.country)
      setCountrySuggestions([])

      setSelectedCountry(selectedCountrySuggestion.country)
      setSelectedObjectData(selectedCountrySuggestion)
      setSelectedObjectType(ObjectType.COUNTRY)
      clearCoordinatesFromCurrentUrl()
      updateCountryInCurrentUrl(selectedCountrySuggestion.country)

      flyToCoordinates(
         selectedCountrySuggestion.latitude,
         selectedCountrySuggestion.longitude,
      )
   }, [
      flyToCoordinates,
      setSelectedCountry,
      setSelectedObjectData,
      setSelectedObjectType,
   ])

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

      setSelectedCountry('')
      setSelectedObjectData(selectedSuggestion)
      setSelectedObjectType(ObjectType.PLACE)
      clearCountryFromCurrentUrl()
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

   const focusOnAirportSuggestion = useCallback((selectedSuggestion: AirportSearchSuggestion): void => {
      const latitudeRaw = selectedSuggestion.feature.attributes.latitude_deg
      const longitudeRaw = selectedSuggestion.feature.attributes.longitude_deg

      if (
         typeof latitudeRaw !== 'number'
         || !Number.isFinite(latitudeRaw)
         || typeof longitudeRaw !== 'number'
         || !Number.isFinite(longitudeRaw)
      ) {
         setErrorMessage('Invalid airport coordinates.')
         setIsInvalid(true)
         return
      }

      const latitude = latitudeRaw
      const longitude = longitudeRaw

      setSearchTerm(selectedSuggestion.label)
      setAirportSuggestions([])

      setSelectedCountry('')
      setSelectedObjectData({ data: selectedSuggestion.feature })
      setSelectedObjectType(ObjectType.AIRPORT)
      clearCountryFromCurrentUrl()
      updateCoordinatesInCurrentUrl(latitude, longitude)

      const zoomMultiplier = displayedSceneData?.type === SceneType.PLANE
         ? AIRPORT_SEARCH_PLANISPHERE_ZOOM_MULTIPLIER
         : AIRPORT_SEARCH_ZOOM_MULTIPLIER

      flyToCoordinates(latitude, longitude, {
         zoomMultiplier,
      })
   }, [
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

   const selectFirstAirportSuggestion = useCallback(async (): Promise<void> => {
      if (selectedSubject !== SearchSubjectType.AIRPORT) {
         return
      }

      let firstSuggestion: AirportSearchSuggestion | undefined = airportSuggestions[0]

      if (firstSuggestion == null && searchTerm.trim() !== '') {
         const refreshedSuggestions = searchAirports(searchTerm)
         setAirportSuggestions(refreshedSuggestions)
         firstSuggestion = refreshedSuggestions[0]
      }

      if (firstSuggestion == null) {
         setErrorMessage('No airport found for this search.')
         setIsInvalid(true)
         return
      }

      setIsInvalid(false)
      focusOnAirportSuggestion(firstSuggestion)
   }, [airportSuggestions, focusOnAirportSuggestion, searchTerm, selectedSubject])

   const selectFirstCountrySuggestion = useCallback((): void => {
      if (selectedSubject !== SearchSubjectType.COUNTRY) {
         return
      }

      let firstSuggestion: Country | undefined = countrySuggestions[0]

      if (firstSuggestion == null && searchTerm.trim() !== '') {
         const refreshedSuggestions = filterCountriesByPrefix(searchTerm)
         setCountrySuggestions(refreshedSuggestions)
         firstSuggestion = refreshedSuggestions[0]
      }

      if (firstSuggestion == null) {
         setErrorMessage('No country found for this search.')
         setIsInvalid(true)
         return
      }

      setIsInvalid(false)
      focusOnCountrySuggestion(firstSuggestion)
   }, [
      countrySuggestions,
      filterCountriesByPrefix,
      focusOnCountrySuggestion,
      searchTerm,
      selectedSubject,
   ])

   /**
    * Debounced function to handle input changes.
    */
   const handleInputChange = useCallback(
      debounce(async (value: string) => {
         if (value.trim() === '') {
            setFeatureSuggestions([])
            setCountrySuggestions([])
            setAirportSuggestions([])
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
               setCountrySuggestions(filterCountriesByPrefix(value))
            } else if (selectedSubject === SearchSubjectType.AIRPORT) {
               setAirportSuggestions(searchAirports(value))
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

      event.preventDefault()

      if (selectedSubject === SearchSubjectType.COUNTRY) {
         selectFirstCountrySuggestion()
         return
      }

      if (selectedSubject === SearchSubjectType.PLACE) {
         void selectFirstPlaceSuggestion()
         return
      }

      if (selectedSubject === SearchSubjectType.AIRPORT) {
         void selectFirstAirportSuggestion()
      }
   }

   /**
    *
    */
   const resetSelection = (): void => {
      setIsInvalid(false)
      setErrorMessage(defaultErrorMessage)
      setSearchTerm('')
      setFeatureSuggestions([])
      setCountrySuggestions([])
      setAirportSuggestions([])
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
            const selectedCountrySuggestion = findCountryByName(String(key ?? ''))

            if (selectedCountrySuggestion != null) {
               setIsInvalid(false)
               focusOnCountrySuggestion(selectedCountrySuggestion)
            } else {
               setErrorMessage('Invalid Country Name.')
               setIsInvalid(true)
            }
            setCountrySuggestions([])
            break
         case SearchSubjectType.AIRPORT:
            const selectedAirportSuggestion = airportSuggestions.find(
               (suggestion: AirportSearchSuggestion): boolean => {
                  return suggestion.key === String(key)
               },
            )

            if (selectedAirportSuggestion != null) {
               setIsInvalid(false)
               focusOnAirportSuggestion(selectedAirportSuggestion)
            }
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

      if (selectedKey !== SearchSubjectType.COUNTRY) {
         setSelectedCountry('')
         clearCountryFromCurrentUrl()
      }

      switch (selectedKey) {
         case SearchSubjectType.PLANE:
            setInputLabel('Plane Name')
            break
         case SearchSubjectType.COUNTRY:
            setInputLabel('Country Name')
            break
         case SearchSubjectType.AIRPORT:
            setInputLabel('Airport (ICAO, IATA, name, location)')
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
      airportSuggestions,
      onSubjectSelected,
      onInputChange,
      onSelectionChange,
      onSearchInputKeyDown,
   }
}
