'use client'
import React from 'react'
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

   return (
      <>
         {selectedObjectType != ObjectType.NULL &&
            selectedObjectData &&
            Object.keys(selectedObjectData).length > 0 && (
               <GlassCard
                  FadeInOut_isVisible={true}
                  FadeInOut_preFadeOutCallback={() => {
                     /*TODO*/
                  }}
                  centered={false}
                  content={
                     selectedObjectType === ObjectType.AIRPORT ? (
                        <AirportDataDisplay />
                     ) : selectedObjectType === ObjectType.PLANE ? (
                        <PlaneDataDisplay />
                     ) : selectedObjectType === ObjectType.VESSEL ? (
                        <VesselDataDisplay />
                     ) : selectedObjectType === ObjectType.PLACE ? (
                        <PlaceDataDisplay />
                     ) : selectedObjectType === ObjectType.COUNTRY ? (
                        <CountryDataDisplay />
                     ) : (
                        <></>
                     )
                  }
                  onClose={(): void => {
                     if (selectedObjectType === ObjectType.PLACE) {
                        clearCoordinatesFromCurrentUrl()
                     }

                     if (selectedObjectType === ObjectType.COUNTRY) {
                        clearCountryFromCurrentUrl()
                        setSelectedCountry('')
                     }

                     setSelectedObjectType(ObjectType.NULL)
                     setSelectedObjectData({})
                  }}
               />
            )}
      </>
   )
}
