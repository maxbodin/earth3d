import React from 'react'
import { N_A_VALUE } from '@/app/constants/strings'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'

const lookup = require('country-data').lookup

export function PlaneDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()

   const selectedPlaneData = selectedObjectData

   if (selectedPlaneData == null) {
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )
   }

   const callsign = selectedPlaneData?.data?.[1] || N_A_VALUE
   const originCountry = selectedPlaneData?.data?.[2] || N_A_VALUE
   const timePosition = selectedPlaneData?.data?.[3] || N_A_VALUE
   const lastContact = selectedPlaneData?.data?.[4] || N_A_VALUE
   const longitude = selectedPlaneData?.data?.[5] || N_A_VALUE
   const latitude = selectedPlaneData?.data?.[6] || N_A_VALUE
   const baroAltitude = selectedPlaneData?.data?.[7] || N_A_VALUE
   const onGround = selectedPlaneData?.data?.[8] ? 'Yes' : 'No'
   const velocity = selectedPlaneData?.data?.[9] || N_A_VALUE
   const trueTrack = selectedPlaneData?.data?.[10] || N_A_VALUE
   const verticalRate = selectedPlaneData?.data?.[11] || N_A_VALUE
   const sensors = selectedPlaneData?.[12]?.data?.join(', ') || N_A_VALUE
   const geoAltitude = selectedPlaneData?.data?.[13] || N_A_VALUE
   const squawk = selectedPlaneData?.data?.[14] || N_A_VALUE
   const spi = selectedPlaneData?.data?.[15] ? 'Yes' : 'No'
   const positionSource = selectedPlaneData?.data?.[16] || N_A_VALUE
   const category = selectedPlaneData?.data?.[17] || N_A_VALUE

   const formattedTimePosition: string = timePosition
      ? new Date(timePosition * 1000).toLocaleString()
      : N_A_VALUE
   const formattedLastContact: string = lastContact
      ? new Date(lastContact * 1000).toLocaleString()
      : N_A_VALUE

   // TODO ADD FALLBACK FOR N/A VALUES
   return (
      <>
         <h2 className="text-white text-4xl font-bold mb-4">{callsign} </h2>
         <div className="flex items-center mb-4">
            <h3 className="text-white text-lg font-bold">
               Origin country: {originCountry}{' '}
               {lookup?.countries({ name: originCountry })[0]?.emoji}
            </h3>
         </div>
         <div className="mb-4">
            <p className="text-gray-300 mb-2">
               Time Position: {formattedTimePosition}
            </p>
            <p className="text-gray-400 text-xs mb-2">
               Last Contact: {formattedLastContact}
            </p>
         </div>
         <p className="text-gray-300 mb-2">
            Longitude: {longitude} Latitude: {latitude}
         </p>
         <p className="text-gray-300 mb-2">
            Barometric Altitude: {baroAltitude}
         </p>
         <p className="text-gray-300 mb-2">On Ground: {onGround}</p>
         <p className="text-gray-300 mb-2">Velocity: {velocity}</p>
         <p className="text-gray-300 mb-2">True Track: {trueTrack}</p>
         <p className="text-gray-300 mb-2">Vertical Rate: {verticalRate}</p>
         <p className="text-gray-300 mb-2">Sensors: {sensors}</p>
         <p className="text-gray-300 mb-2">Geometric Altitude: {geoAltitude}</p>
         <p className="text-gray-300 mb-2">Squawk: {squawk}</p>
         <p className="text-gray-300 mb-2">SPI: {spi}</p>
         <p className="text-gray-300 mb-2">Position Source: {positionSource}</p>
         <p className="text-gray-300 mb-2">Category: {category}</p>
      </>
   )
}
