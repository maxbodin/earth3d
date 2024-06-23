import React, { useCallback, useState } from 'react'
import countriesCoords from '@/app/data/country-codes-lat-long-alpha3.json'
import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { ThreeGeoUnitsUtils } from '@/app/utils/micUnitsUtils'
import { EARTH_RADIUS } from '@/app/constants/numbers'
import { gsap } from 'gsap'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import debounce from 'lodash/debounce'
import { SearchSubjectType } from '@/app/enums/SearchSubjectType'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import { autocomplete } from '@/app/server/services/openRouteService'
import { Country } from '@/app/types/countryType'
import { Selection } from '@nextui-org/react'
import { useSearchBar } from '@/app/components/organisms/searchBar/searchBar.model'

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

   const { displayedSceneData } = useScenes()
   const { selectedSubject, setSelectedSubject } = useSearchBar()

   /**
    *
    * @param countryName
    */
   const flyToCountryPos = (countryName: string): void => {
      if (!countryName) return

      for (const country of countriesCoords.ref_country_codes) {
         if (country.country.toUpperCase() === countryName.toUpperCase()) {
            setIsInvalid(false)
            flyToCoordinates(country.latitude, country.longitude)
            break // Stop the loop when the country is found.
         }

         setErrorMessage('Invalid Country Name.')
         setIsInvalid(true)
      }
   }

   /**
    *
    * @param latitude
    * @param longitude
    */
   const flyToCoordinates = (latitude: number, longitude: number): void => {
      let targetPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

      if (displayedSceneData.type == SceneType.SPHERICAL) {
         targetPosition = latLongToVector3(
            latitude as number,
            longitude as number,
         )
      } else if (displayedSceneData.type == SceneType.PLANE) {
         const worldPos: THREE.Vector2 = ThreeGeoUnitsUtils.datumsToSpherical(
            latitude as number,
            longitude as number,
         )
         targetPosition = new THREE.Vector3(worldPos.x, 0, -worldPos.y)
      }
      // Get current spherical coordinates of the camera relative to the target
      const target = displayedSceneData.controls.target
      const currentPosition = new THREE.Vector3()
      currentPosition.copy(displayedSceneData.camera.position).sub(target)

      const sphericalCurrent = new THREE.Spherical().setFromVector3(
         currentPosition,
      )
      const sphericalTarget = new THREE.Spherical().setFromVector3(
         targetPosition.clone().sub(target),
      )

      // Set a target zoom.
      const targetZoom: number = EARTH_RADIUS * 1.2

      // Use GSAP to animate the spherical coordinates.
      gsap.to(sphericalCurrent, {
         duration: 2,
         theta: sphericalTarget.theta,
         phi: sphericalTarget.phi,
         radius: targetZoom,
         onUpdate: () => {
            // Update camera position based on new spherical coordinates
            const newPosition = new THREE.Vector3()
               .setFromSpherical(sphericalCurrent)
               .add(target)
            displayedSceneData.camera.position.copy(newPosition)
            displayedSceneData.camera.lookAt(target)
            displayedSceneData.controls.update()
         },
         ease: 'power2.inOut',
      })
   }

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
               const data: GeocodeResponse = await autocomplete(value)
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
            setAutoCompleteError('Error fetching autocomplete results.')
         } finally {
            setAutoCompleteLoading(false)
         }
      }, 300), // Throttle input to 300ms.
      [selectedSubject],
   )

   /**
    *
    * @param value
    */
   const onInputChange = (value: string) => {
      resetSelection()
      setSearchTerm(value)
      handleInputChange(value)
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
   const onSelectionChange = (key: React.Key): void => {
      // TODO onSearch(selectedSuggestion.properties.label)

      switch (selectedSubject) {
         case SearchSubjectType.PLANE:
            break
         case SearchSubjectType.COUNTRY:
            flyToCountryPos(key as string)
            setCountrySuggestions([])
            break
         case SearchSubjectType.PLACE:
            const selectedSuggestion: Feature | undefined =
               featureSuggestions.find(
                  (suggestion: Feature): boolean =>
                     suggestion.properties?.id === key,
               )

            if (selectedSuggestion) {
               setSearchTerm(selectedSuggestion.properties.label)
               setFeatureSuggestions([])

               flyToCoordinates(
                  selectedSuggestion.geometry.coordinates[1],
                  selectedSuggestion.geometry.coordinates[0],
               )
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
   }
}
