'use client'
import { useCallback, useMemo } from 'react'
import { GlassCard } from '@/app/components/molecules/glassCard/glassCard'
import { PlaneDataDisplay } from '../../atoms/dataDisplay/planeDataDisplay/planeDataDisplay'
import { AirportDataDisplay } from '../../atoms/dataDisplay/airportDataDisplay/airportDataDisplay'
import { VesselDataDisplay } from '@/app/components/atoms/dataDisplay/vesselDataDisplay/vesselDataDisplay'
import { ObjectType } from '@/app/enums/objectType'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { PlaceDataDisplay } from '@/app/components/atoms/dataDisplay/placeDataDisplay/placeDataDisplay'
import {
   clearCoordinatesFromCurrentUrl,
   clearCountryFromCurrentUrl,
} from '@/app/lib/coordinatesSearchParams'
import { CountryDataDisplay } from '@/app/components/atoms/dataDisplay/countryDataDisplay/countryDataDisplay'
import { useCountries } from '@/app/components/atoms/three/countries/countries.model'

export function DetailsCard() {
   const {
      selectedObjectType,
      setSelectedObjectType,
      selectedObjectData,
      setSelectedObjectData,
   } = useSelection()
   const { setSelectedCountry } = useCountries()

   const isVisible = useMemo(() => {
      return selectedObjectType !== ObjectType.NULL
         && selectedObjectData != null
         && Object.keys(selectedObjectData).length > 0
   }, [selectedObjectType, selectedObjectData])

   const handleClose = useCallback((): void => {
      if (selectedObjectType === ObjectType.PLACE) {
         clearCoordinatesFromCurrentUrl()
      }

      if (selectedObjectType === ObjectType.COUNTRY) {
         clearCountryFromCurrentUrl()
         setSelectedCountry('')
      }

      setSelectedObjectType(ObjectType.NULL)
      setSelectedObjectData({})
   }, [selectedObjectType, setSelectedObjectType, setSelectedObjectData, setSelectedCountry])

   const content = useMemo(() => {
      switch (selectedObjectType) {
         case ObjectType.AIRPORT:
            return <AirportDataDisplay />
         case ObjectType.PLANE:
            return <PlaneDataDisplay />
         case ObjectType.VESSEL:
            return <VesselDataDisplay />
         case ObjectType.PLACE:
            return <PlaceDataDisplay />
         case ObjectType.COUNTRY:
            return <CountryDataDisplay />
         default:
            return null
      }
   }, [selectedObjectType])

   return (
      <GlassCard
         isVisible={isVisible}
         content={content}
         onClose={handleClose}
      />
   )
}
