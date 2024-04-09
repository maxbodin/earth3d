import React from 'react'
import { useData } from '@/app/context/dataContext'
import { N_A_VALUE } from '@/app/constants/strings'

export function VesselDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useData()

   const message = selectedObjectData?.message

   if (message == null) {
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )
   }

   const mmsi: string = message.mmsi || N_A_VALUE
   const name: string = message.name || N_A_VALUE
   const time_utc: string = message.time_utc?.toString() || N_A_VALUE
   const callsign: string = message.callsign || N_A_VALUE
   const destination: string = message.destination || N_A_VALUE
   const dimension: string = message.dimension?.toString() || N_A_VALUE
   const eta: string = message.eta || N_A_VALUE
   const imo: string = message.imo || N_A_VALUE
   const cargo_type_code: string = message.imo || N_A_VALUE
   const cog: string = message.cog || N_A_VALUE
   const sog: string = message.sog || N_A_VALUE
   const hdg: string = message.hdg || N_A_VALUE
   const latitude: string =
      message.location.coordinates[0]?.toFixed(3) || N_A_VALUE
   const longitude: string =
      message.location.coordinates[1]?.toFixed(3) || N_A_VALUE

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
               Longitude: {longitude} Latitude: {latitude}
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
            {longitude == N_A_VALUE && (
               <p className="text-gray-400">Longitude: {longitude}</p>
            )}{' '}
            {latitude == N_A_VALUE && (
               <p className="text-gray-400">Latitude: {latitude}</p>
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
      </div>
   )
}
