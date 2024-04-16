import React from 'react'
import { GlassCard } from '@/app/components/molecules/glassCard/glassCard'
import { PlaneDataDisplay } from '../../atoms/dataDisplay/planeDataDisplay/planeDataDisplay'
import { ObjectType } from '@/app/components/enums/objectType'
import { useData } from '@/app/context/dataContext'
import { AirportDataDisplay } from '../../atoms/dataDisplay/airportDataDisplay/airportDataDisplay'
import { VesselDataDisplay } from '@/app/components/atoms/dataDisplay/vesselDataDisplay/vesselDataDisplay'

export function DetailsCard() {
   const {
      selectedObjectType,
      setSelectedObjectType,
      selectedObjectData,
      setSelectedObjectData,
   } = useData()

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
                        <AirportDataDisplay
                           selectedAirportData={selectedObjectData}
                        />
                     ) : selectedObjectType === ObjectType.PLANE ? (
                        <PlaneDataDisplay
                           selectedPlaneData={selectedObjectData}
                        />
                     ) : selectedObjectType === ObjectType.VESSEL ? (
                        <VesselDataDisplay />
                     ) : (
                        <></>
                     )
                  }
                  onClose={(): void => {
                     setSelectedObjectType(ObjectType.NULL)
                     setSelectedObjectData({})
                  }}
               />
            )}
      </>
   )
}
