'use client'

import { useEffect, useRef } from 'react'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { ObjectType } from '@/app/enums/objectType'
import { SceneType } from '@/app/enums/sceneType'
import {
   COORDINATES_SEARCH_PARAMS_UPDATED_EVENT,
   coordinatesToKey,
   normalizeCoordinates,
   parseCoordinatesFromUnknown,
   readCoordinatesFromCurrentUrl,
   updateCoordinatesInCurrentUrl,
} from '@/app/lib/coordinatesSearchParams'
import { Coordinates } from '@/app/types/coordinates'

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

export function CoordinatesSearchParamsSync(): null {
   const { selectedObjectData, selectedObjectType } = useSelection()
   const { displayedSceneData } = useScenes()
   const { flyToCoordinates } = CameraFlyController()

   const lastFocusedCoordinatesKeyRef = useRef<string | null>(null)

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
      if (displayedSceneData?.type !== SceneType.PLANE) {
         lastFocusedCoordinatesKeyRef.current = null
      }
   }, [displayedSceneData?.type])

   useEffect((): (() => void) | void => {
      if (displayedSceneData?.type !== SceneType.PLANE) return

      const focusCoordinatesFromSearchParams = (): void => {
         const coordinates = readCoordinatesFromCurrentUrl()
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

   return null
}
