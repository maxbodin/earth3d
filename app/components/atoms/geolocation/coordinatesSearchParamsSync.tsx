'use client'

import { useEffect, useRef } from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { ObjectType } from '@/app/enums/objectType'
import { SceneType } from '@/app/enums/sceneType'
import {
   COORDINATES_SEARCH_PARAMS_UPDATED_EVENT,
   clearCountryFromCurrentUrl,
   coordinatesToKey,
   normalizeCoordinates,
   parseCoordinatesFromUnknown,
   readCountryFromCurrentUrl,
   readCoordinatesFromCurrentUrl,
   updateCountryInCurrentUrl,
   updateCoordinatesInCurrentUrl,
} from '@/app/lib/coordinatesSearchParams'
import { Coordinates } from '@/app/types/coordinates'
import { useCountries } from '@/app/components/atoms/three/countries/countries.model'
import { findCountryByName } from '@/app/lib/countrySearch'
import { normalizeCountryName } from '@/lib/normalize/normalizeCountryName'

function extractCoordinatesFromSelection(
   selectedObjectType: ObjectType,
   selectedObjectData: any,
): Coordinates | null {
   switch (selectedObjectType) {
      case ObjectType.PLACE:
         return normalizeCoordinates(
            selectedObjectData?.geometry?.coordinates?.[1],
            selectedObjectData?.geometry?.coordinates?.[0],
         )
      case ObjectType.AIRPORT:
         return normalizeCoordinates(
            selectedObjectData?.data?.attributes?.latitude_deg,
            selectedObjectData?.data?.attributes?.longitude_deg,
         )
      case ObjectType.PLANE:
         return normalizeCoordinates(
            selectedObjectData?.data?.[6],
            selectedObjectData?.data?.[5],
         )
      case ObjectType.VESSEL:
         return parseCoordinatesFromUnknown(
            selectedObjectData?.message?.location?.coordinates,
         )
      default:
         return null
   }
}

function extractCountryFromSelection(
   selectedObjectType: ObjectType,
   selectedObjectData: any,
): string | null {
   if (selectedObjectType !== ObjectType.COUNTRY) {
      return null
   }

   if (typeof selectedObjectData?.country !== 'string') {
      return null
   }

   const trimmedCountry = selectedObjectData.country.trim()
   return trimmedCountry.length > 0 ? trimmedCountry : null
}

export function CoordinatesSearchParamsSync(): null {
   const {
      selectedObjectData,
      selectedObjectType,
      setSelectedObjectData,
      setSelectedObjectType,
   } = useSelection()
   const { setSelectedCountry } = useCountries()
   const { displayedSceneData } = useScenes()
   const { flyToCoordinates } = CameraFlyController()

   const lastFocusedCoordinatesKeyRef = useRef<string | null>(null)
   const lastFocusedCountryKeyRef = useRef<string | null>(null)

   useEffect((): void => {
      const selectedCoordinates = extractCoordinatesFromSelection(
         selectedObjectType,
         selectedObjectData,
      )

      if (selectedCoordinates == null) return

      updateCoordinatesInCurrentUrl(
         selectedCoordinates.latitude,
         selectedCoordinates.longitude,
      )
   }, [selectedObjectData, selectedObjectType])

   useEffect((): void => {
      const selectedCountry = extractCountryFromSelection(
         selectedObjectType,
         selectedObjectData,
      )

      if (selectedCountry != null) {
         lastFocusedCountryKeyRef.current = normalizeCountryName(selectedCountry)
         updateCountryInCurrentUrl(selectedCountry)
         return
      }

      if (selectedObjectType !== ObjectType.NULL) {
         lastFocusedCountryKeyRef.current = null
         clearCountryFromCurrentUrl()
      }
   }, [selectedObjectData, selectedObjectType])

   useEffect((): void => {
      if (
         selectedObjectType !== ObjectType.NULL
         && selectedObjectType !== ObjectType.COUNTRY
      ) {
         setSelectedCountry('')
      }
   }, [selectedObjectType, setSelectedCountry])

   useEffect((): void => {
      if (displayedSceneData?.type !== SceneType.PLANE) {
         lastFocusedCoordinatesKeyRef.current = null
      }
   }, [displayedSceneData?.type])

   useEffect((): (() => void) | void => {
      if (displayedSceneData?.type !== SceneType.PLANE) return

      const focusCoordinatesFromSearchParams = (): void => {
         const coordinates = readCoordinatesFromCurrentUrl()

         if (readCountryFromCurrentUrl() != null) {
            lastFocusedCoordinatesKeyRef.current = null
            return
         }

         if (coordinates == null) {
            lastFocusedCoordinatesKeyRef.current = null
            return
         }

         const coordinatesKey = coordinatesToKey(coordinates)
         if (lastFocusedCoordinatesKeyRef.current === coordinatesKey) return

         lastFocusedCoordinatesKeyRef.current = coordinatesKey

         flyToCoordinates(coordinates.latitude, coordinates.longitude)
      }

      focusCoordinatesFromSearchParams()

      window.addEventListener('popstate', focusCoordinatesFromSearchParams)
      window.addEventListener(
         COORDINATES_SEARCH_PARAMS_UPDATED_EVENT,
         focusCoordinatesFromSearchParams,
      )

      return (): void => {
         window.removeEventListener('popstate', focusCoordinatesFromSearchParams)
         window.removeEventListener(
            COORDINATES_SEARCH_PARAMS_UPDATED_EVENT,
            focusCoordinatesFromSearchParams,
         )
      }
   }, [displayedSceneData?.type, flyToCoordinates])

   useEffect((): (() => void) | void => {
      if (displayedSceneData == null) return

      const focusCountryFromSearchParams = (): void => {
         const countryNameFromSearchParams = readCountryFromCurrentUrl()

         if (countryNameFromSearchParams == null) {
            lastFocusedCountryKeyRef.current = null
            return
         }

         const matchedCountry = findCountryByName(countryNameFromSearchParams)
         if (matchedCountry == null) {
            lastFocusedCountryKeyRef.current = null
            return
         }

         const normalizedCountryKey = normalizeCountryName(matchedCountry.country)
         if (lastFocusedCountryKeyRef.current === normalizedCountryKey) {
            return
         }

         lastFocusedCountryKeyRef.current = normalizedCountryKey

         setSelectedCountry(matchedCountry.country)
         setSelectedObjectData(matchedCountry)
         setSelectedObjectType(ObjectType.COUNTRY)
         flyToCoordinates(matchedCountry.latitude, matchedCountry.longitude)
      }

      focusCountryFromSearchParams()

      window.addEventListener('popstate', focusCountryFromSearchParams)
      window.addEventListener(
         COORDINATES_SEARCH_PARAMS_UPDATED_EVENT,
         focusCountryFromSearchParams,
      )

      return (): void => {
         window.removeEventListener('popstate', focusCountryFromSearchParams)
         window.removeEventListener(
            COORDINATES_SEARCH_PARAMS_UPDATED_EVENT,
            focusCountryFromSearchParams,
         )
      }
   }, [
      displayedSceneData,
      flyToCoordinates,
      setSelectedCountry,
      setSelectedObjectData,
      setSelectedObjectType,
   ])

   return null
}
