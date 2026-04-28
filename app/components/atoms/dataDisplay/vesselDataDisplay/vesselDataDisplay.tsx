import React from 'react'
import { N_A_VALUE } from '@/app/constants/strings'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { Button } from '@nextui-org/react'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { EyeIcon } from '@nextui-org/shared-icons'
import { parseCoordinatesFromUnknown } from '@/lib/parse/parseCoordinates'

// TODO : Refactor in cleaner arch like place data display.
export function VesselDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()

   const { flyToCoordinates } = CameraFlyController()

   const message = selectedObjectData?.message

   if (message == null) {
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )
   }

   const mmsi: string = message.mmsi?.toString() || N_A_VALUE
   const name: string = message.name?.toString() || N_A_VALUE
   const time_utc: string = message.time_utc?.toString() || N_A_VALUE
   const callsign: string = message.callsign?.toString() || N_A_VALUE
   const destination: string = message.destination?.toString() || N_A_VALUE
   const dimension: string =
      JSON.stringify(message.dimension)?.toString() || N_A_VALUE
   const eta: string = message.eta?.toString() || N_A_VALUE
   const imo: string = message.imo?.toString() || N_A_VALUE
   const cargo_type_code: string = message.imo?.toString() || N_A_VALUE
   const cog: string = message.cog?.toString() || N_A_VALUE
   const sog: string = message.sog?.toString() || N_A_VALUE
   const hdg: string = message.hdg?.toString() || N_A_VALUE
   const coordinates = parseCoordinatesFromUnknown(message.location?.coordinates)

   const latitude = coordinates?.latitude
   const longitude = coordinates?.longitude

   const strLatitude: string =
      latitude != null ? latitude.toFixed(3) : N_A_VALUE
   const strLongitude: string =
      longitude != null ? longitude.toFixed(3) : N_A_VALUE

   return (
      <div>
         {mmsi != N_A_VALUE && (
            <h2 className="text-white text-2xl font-bold mb-2">
               MMSI: {mmsi}{' '}
            </h2>
         )}
         {name != N_A_VALUE && (
            <h2 className="text-white text-xl font-bold mb-2">
               Vessel Name: {name}{' '}
            </h2>
         )}
         {callsign != N_A_VALUE && (
            <h2 className="text-white text-l font-bold mb-2">
               CallSign: {callsign}{' '}
            </h2>
         )}
         {destination != N_A_VALUE && (
            <h2 className="text-white text-l font-bold mb-2">
               Destination: {destination}{' '}
            </h2>
         )}
         {dimension != N_A_VALUE && (
            <h2 className="text-white text-l font-bold mb-2">
               Dimension: {dimension}{' '}
            </h2>
         )}
         {cargo_type_code != N_A_VALUE && (
            <h2 className="text-white text-m font-bold mb-2">
               Cargo Type Code: {cargo_type_code}{' '}
            </h2>
         )}
         <div className="mb-2">
            {time_utc != N_A_VALUE && (
               <p className="text-white">Last communication: {time_utc}</p>
            )}
         </div>
         <div className="mb-2">
            <p className="text-gray-300">
               Longitude: {strLongitude}
            </p>
            <p className="text-gray-300">
               Latitude: {strLatitude}
            </p>

            {eta != N_A_VALUE && (
               <p className="text-gray-300">Estimated Time of Arrival: {eta}</p>
            )}
            {imo != N_A_VALUE && (
               <p className="text-gray-300">
                  IMO (European Number of Identification): {imo}
               </p>
            )}
            {hdg != N_A_VALUE && (
               <p className="text-gray-300">Ship Heading: {hdg}</p>
            )}
            {sog != N_A_VALUE && (
               <p className="text-gray-300">Speed Over Ground: {sog}</p>
            )}
            {cog != N_A_VALUE && (
               <p className="text-gray-300">Course Over Ground: {cog}</p>
            )}
         </div>
         {
            // Fallback for N/A values here:
         }
         {mmsi == N_A_VALUE && (
            <h2 className="text-gray-400 text-xl font-bold mb-2">
               MMSI: {mmsi}{' '}
            </h2>
         )}
         {name == N_A_VALUE && (
            <h2 className="text-gray-400 text-l font-bold mb-2">
               Vessel Name: {name}{' '}
            </h2>
         )}
         {callsign == N_A_VALUE && (
            <h2 className="text-gray-400 text-l font-bold mb-2">
               CallSign: {callsign}{' '}
            </h2>
         )}
         {destination == N_A_VALUE && (
            <h2 className="text-gray-400 text-m font-bold mb-2">
               Destination: {destination}{' '}
            </h2>
         )}
         {dimension == N_A_VALUE && (
            <h2 className="text-gray-400 text-m font-bold mb-2">
               Dimension: {dimension}{' '}
            </h2>
         )}
         {cargo_type_code == N_A_VALUE && (
            <h2 className="text-gray-400 text-m font-bold mb-2">
               Cargo Type Code: {cargo_type_code}{' '}
            </h2>
         )}
         {time_utc == N_A_VALUE && (
            <p className="text-gray-400">Last communication: {time_utc}</p>
         )}
         <div className="mb-2 mt-2">
            {strLongitude == N_A_VALUE && (
               <p className="text-gray-400">Longitude: {N_A_VALUE}</p>
            )}{' '}
            {strLatitude == N_A_VALUE && (
               <p className="text-gray-400">Latitude: {N_A_VALUE}</p>
            )}
            {eta == N_A_VALUE && (
               <p className="text-gray-400">Estimated Time of Arrival: {eta}</p>
            )}
            {imo == N_A_VALUE && (
               <p className="text-gray-400">
                  IMO (European Number of Identification): {imo}
               </p>
            )}
            {hdg == N_A_VALUE && (
               <p className="text-gray-400">Ship Heading: {hdg}</p>
            )}
            {sog == N_A_VALUE && (
               <p className="text-gray-400">Speed Over Ground: {sog}</p>
            )}
            {cog == N_A_VALUE && (
               <p className="text-gray-400">Course Over Ground: {cog}</p>
            )}
         </div>

         {latitude != null && longitude != null && <Button
            variant="bordered"
            size="sm"
            aria-label="Focus view on vessel"
            className="z-50 bg-black bg-opacity-50"
            endContent={<EyeIcon />}
            onPress={(): void => {
               flyToCoordinates(latitude, longitude)
            }}>
            Focus view on vessel
         </Button>}
      </div>
   )
}
