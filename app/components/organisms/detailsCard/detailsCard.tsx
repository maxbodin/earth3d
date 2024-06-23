import React from 'react'
import { GlassCard } from '@/app/components/molecules/glassCard/glassCard'
import { PlaneDataDisplay } from '../../atoms/dataDisplay/planeDataDisplay/planeDataDisplay'
import { useData } from '@/app/context_todo_improve/dataContext'
import { AirportDataDisplay } from '../../atoms/dataDisplay/airportDataDisplay/airportDataDisplay'
import { VesselDataDisplay } from '@/app/components/atoms/dataDisplay/vesselDataDisplay/vesselDataDisplay'
import { ObjectType } from '@/app/enums/objectType'

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
