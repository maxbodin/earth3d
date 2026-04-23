import React from 'react'
import { N_A_VALUE } from '@/app/constants/strings'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { parseSelectedPlaneStateVector } from '@/lib/parse/parseSelectedPlaneStateVector'
import { formatTimestamp } from '@/lib/format/formatTimestamp'
import { formatValue } from '@/lib/format/formatValue'

const lookup = require('country-data').lookup

// TODO : Refactor like place data details.
export function PlaneDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()

   const selectedPlaneState = parseSelectedPlaneStateVector(selectedObjectData)

   if (selectedPlaneState == null) {
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )
   }

   const icao24 = selectedPlaneState[0]
   const callsign = selectedPlaneState[1]
   const originCountry = selectedPlaneState[2]
   const timePosition = selectedPlaneState[3]
   const lastContact = selectedPlaneState[4]
   const longitude = selectedPlaneState[5]
   const latitude = selectedPlaneState[6]
   const baroAltitude = selectedPlaneState[7]
   const onGround = selectedPlaneState[8]
   const velocity = selectedPlaneState[9]
   const trueTrack = selectedPlaneState[10]
   const verticalRate = selectedPlaneState[11]
   const sensors = selectedPlaneState[12]
   const geoAltitude = selectedPlaneState[13]
   const squawk = selectedPlaneState[14]
   const spi = selectedPlaneState[15]
   const positionSource = selectedPlaneState[16]
   const category = selectedPlaneState[17]

   const displayedPlaneName = callsign ?? icao24 ?? N_A_VALUE
   const formattedTimePosition = formatTimestamp(timePosition)
   const formattedLastContact = formatTimestamp(lastContact)
   const formattedSensors = sensors == null || sensors.length === 0
      ? N_A_VALUE
      : sensors.join(', ')
   const originCountryEmoji = originCountry == null
      ? ''
      : lookup?.countries({ name: originCountry })[0]?.emoji ?? ''

   // TODO ADD FALLBACK FOR N/A VALUES
   return (
      <>
         <h2 className="text-white text-4xl font-bold mb-4">{displayedPlaneName} </h2>
         <div className="flex items-center mb-4">
            <h3 className="text-white text-lg font-bold">
               Origin country: {formatValue(originCountry)}{' '}
               {originCountryEmoji}
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
            Longitude: {formatValue(longitude)} Latitude: {formatValue(latitude)}
         </p>
         <p className="text-gray-300 mb-2">
            Barometric Altitude: {formatValue(baroAltitude)}
         </p>
         <p className="text-gray-300 mb-2">On Ground: {onGround ? 'Yes' : 'No'}</p>
         <p className="text-gray-300 mb-2">Velocity: {formatValue(velocity)}</p>
         <p className="text-gray-300 mb-2">True Track: {formatValue(trueTrack)}</p>
         <p className="text-gray-300 mb-2">Vertical Rate: {formatValue(verticalRate)}</p>
         <p className="text-gray-300 mb-2">Sensors: {formattedSensors}</p>
         <p className="text-gray-300 mb-2">Geometric Altitude: {formatValue(geoAltitude)}</p>
         <p className="text-gray-300 mb-2">Squawk: {formatValue(squawk)}</p>
         <p className="text-gray-300 mb-2">SPI: {spi ? 'Yes' : 'No'}</p>
         <p className="text-gray-300 mb-2">Position Source: {formatValue(positionSource)}</p>
         <p className="text-gray-300 mb-2">Category: {formatValue(category)}</p>
      </>
   )
}
