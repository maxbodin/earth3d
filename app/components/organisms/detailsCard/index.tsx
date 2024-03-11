import React from 'react'
import { GlassCard } from '@/app/components/molecules/glassCard'
import { PlaneData } from '@/app/components/atoms/planeData'
import { ObjectType } from '@/app/components/atoms/objectType'
import { useData } from '@/app/context/dataContext'
import { AirportData } from '@/app/components/atoms/airportData'

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
                  content={
                     selectedObjectType === ObjectType.AIRPORT ? (
                        <AirportData selectedAirportData={selectedObjectData} />
                     ) : selectedObjectType === ObjectType.PLANE ? (
                        <PlaneData selectedPlaneData={selectedObjectData} />
                     ) : selectedObjectType === ObjectType.BOAT ? (
                        <div>Boat Details</div>
                     ) : null
                  }
                  onClose={() => {
                     setSelectedObjectType(ObjectType.NULL)
                     setSelectedObjectData({})
                  }}
               />
            )}
      </>
   )
}
