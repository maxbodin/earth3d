'use client'
import { useCallback, useMemo } from 'react'
import { GlassCard } from '@/app/components/molecules/glassCard/glassCard'
import { PlaneDataDisplay } from '@/app/components/atoms/dataDisplay/planeDataDisplay'
import { AirportDataDisplay } from '@/app/components/atoms/dataDisplay/airportDataDisplay'
import { VesselDataDisplay } from '@/app/components/atoms/dataDisplay/vesselDataDisplay'
import { ObjectType } from '@/app/enums/objectType'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { PlaceDataDisplay } from '@/app/components/atoms/dataDisplay/placeDataDisplay/placeDataDisplay'
import { clearCoordinatesFromCurrentUrl, } from '@/app/lib/coordinatesSearchParams'
import { clearCountryFromCurrentUrl, } from '@/app/lib/countrySearchParams'
import { CountryDataDisplay } from '@/app/components/atoms/dataDisplay/countryDataDisplay'
import { EarthquakeDataDisplay } from '@/app/components/atoms/dataDisplay/earthquakeDataDisplay'
import { VolcanoDataDisplay } from '@/app/components/atoms/dataDisplay/volcanoDataDisplay'
import { MarkerDataDisplay } from '@/app/components/atoms/dataDisplay/markerDataDisplay'
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
         case ObjectType.EARTHQUAKE:
            return <EarthquakeDataDisplay />
         case ObjectType.VOLCANO:
            return <VolcanoDataDisplay />
         case ObjectType.MARKER:
            return <MarkerDataDisplay />
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
