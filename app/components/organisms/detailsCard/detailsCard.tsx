import React from 'react'
import { GlassCard } from '@/app/components/molecules/glassCard/glassCard'
import { PlaneDataDisplay } from '../../atoms/dataDisplay/planeDataDisplay/planeDataDisplay'
import { AirportDataDisplay } from '../../atoms/dataDisplay/airportDataDisplay/airportDataDisplay'
import { VesselDataDisplay } from '@/app/components/atoms/dataDisplay/vesselDataDisplay/vesselDataDisplay'
import { ObjectType } from '@/app/enums/objectType'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'

export function DetailsCard() {
   const {
      selectedObjectType,
      setSelectedObjectType,
      selectedObjectData,
      setSelectedObjectData,
   } = useSelection()

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
