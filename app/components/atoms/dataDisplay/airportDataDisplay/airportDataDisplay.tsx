import React from 'react'
import { Link } from '@/app/components/atoms/ui/link/link'
import { getContinentEmoji, getContinentString, getTypeString } from '@/app/helpers/beautifyHelper'
import { N_A_VALUE } from '@/app/constants/strings'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'

const lookup = require('country-data').lookup

export function AirportDataDisplay(): React.JSX.Element {
   const { selectedObjectData } = useSelection()

   const attributes = selectedObjectData?.data?.attributes

   if (attributes == null)
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )

   const name = attributes.name || N_A_VALUE
   const type = attributes.type || N_A_VALUE
   const continent = attributes.continent || N_A_VALUE
   const description = attributes.description || N_A_VALUE
   const latitude_deg = attributes.latitude_deg?.toFixed(3) || N_A_VALUE
   const longitude_deg = attributes.longitude_deg?.toFixed(3) || N_A_VALUE
   const elevation_ft = attributes.elevation_ft || N_A_VALUE
   const closed = attributes.closed || N_A_VALUE
   const frequency_mhz = attributes.frequency_mhz || N_A_VALUE
   const gps_code = attributes.gps_code || N_A_VALUE
   const home_link = attributes.home_link || N_A_VALUE
   const iata_code = attributes.iata_code || N_A_VALUE
   const ident = attributes.ident || N_A_VALUE
   const iso_country = attributes.iso_country || N_A_VALUE
   const iso_region = attributes.iso_region || N_A_VALUE
   const length_ft = attributes.length_ft || N_A_VALUE
   const lighted = attributes.lighted || N_A_VALUE
   const local_code = attributes.local_code || N_A_VALUE
   const municipality = attributes.municipality || N_A_VALUE
   const scheduled_service = attributes.scheduled_service || N_A_VALUE
   const surface = attributes.surface || N_A_VALUE
   const width_ft = attributes.width_ft || N_A_VALUE
   const wikipedia_link = attributes.wikipedia_link || N_A_VALUE

   return (
      <div>
         {name != N_A_VALUE && (
            <h2 className="text-white text-2xl font-bold mb-2">
               Name: {name}{' '}
            </h2>
         )}
         {type != N_A_VALUE && (
            <h2 className="text-white text-xl font-bold mb-2">
               Type: {getTypeString(type)}{' '}
            </h2>
         )}
         <div className="mb-4">
            {continent != N_A_VALUE && (
               <div className="flex items-center">
                  <h3 className="text-white text-lg font-bold">
                     Continent: {getContinentString(continent)}{' '}
                     {getContinentEmoji(continent)}
                  </h3>
               </div>
            )}
            {iso_country != N_A_VALUE && (
               <>
                  <h3 className="text-white font-bold">
                     ISO Country: {iso_country}{' '}
                     {lookup?.countries({ alpha2: iso_country })[0]?.emoji}
                  </h3>
                  <h3 className="text-white font-bold">
                     Country:{' '}
                     {lookup?.countries({ alpha2: iso_country })[0]?.name}{' '}
                     {lookup?.countries({ alpha2: iso_country })[0]?.emoji}
                  </h3>
               </>
            )}
            {iso_region != N_A_VALUE && (
               <h3 className="text-white font-bold">
                  ISO Region: {iso_region}
               </h3>
            )}
            {municipality != N_A_VALUE && (
               <h3 className="text-white font-bold">
                  Municipality: {municipality}
               </h3>
            )}
         </div>
         <div className="mb-2">
            {iata_code != N_A_VALUE && (
               <p className="text-white">IATA Code: {iata_code}</p>
            )}
            {ident != N_A_VALUE && (
               <>
                  <p className="text-white">IDENT: {ident}</p>
                  <Link
                     link={`https://metar-taf.com/${ident}`}
                     title={`METAR-TAF ${ident}`}
                  />
               </>
            )}
            {local_code != N_A_VALUE && (
               <p className="text-white">Local Code: {local_code}</p>
            )}
         </div>
         {description != N_A_VALUE && (
            <p className="text-white mb-2">Description: {description}</p>
         )}
         <div className="mb-2">
            <p className="text-gray-300">
               Longitude: {longitude_deg} Latitude: {latitude_deg}
            </p>
            {elevation_ft != N_A_VALUE && (
               <p className="text-gray-300">Elevation: {elevation_ft} feet</p>
            )}
            {length_ft != N_A_VALUE && (
               <p className="text-gray-300">
                  Length: {length_ft} feet Width: {width_ft} feet
               </p>
            )}
         </div>
         {closed != N_A_VALUE && (
            <p className="text-gray-300 mb-2">Closed: {closed}</p>
         )}
         {frequency_mhz != N_A_VALUE && (
            <p className="text-gray-300 mb-2">Frequency: {frequency_mhz} mhz</p>
         )}
         {gps_code != N_A_VALUE && (
            <p className="text-gray-300 mb-2">GPS Code: {gps_code}</p>
         )}
         {lighted != N_A_VALUE && (
            <p className="text-gray-300 mb-2">
               Lighted: {Boolean(lighted).toString()} {Boolean(lighted) && '💡'}
            </p>
         )}{' '}
         {scheduled_service != N_A_VALUE && (
            <p className="text-gray-300 mb-2">
               Scheduled Service: {scheduled_service}
            </p>
         )}
         {surface != N_A_VALUE && (
            <p className="text-gray-300 mb-2">Surface: {surface}</p>
         )}
         {home_link != N_A_VALUE && (
            <Link link={home_link} title={'Home Link'} />
         )}
         {wikipedia_link != N_A_VALUE && (
            <Link link={wikipedia_link} title={'Wikipedia Link'} />
         )}
         {
            // Fallback for N/A values here:
         }
         {name == N_A_VALUE && (
            <h2 className="text-gray-400 text-2xl font-bold mb-2">
               Name: {name}{' '}
            </h2>
         )}
         {type == N_A_VALUE && (
            <h2 className="text-gray-400 text-xl font-bold mb-2">
               Type: {getTypeString(type)}{' '}
            </h2>
         )}
         <div className="mb-4">
            {continent == N_A_VALUE && (
               <div className="flex items-center">
                  <h3 className="text-gray-400 text-lg font-bold">
                     Continent: {getContinentString(continent)}{' '}
                     {getContinentEmoji(continent)}
                  </h3>
               </div>
            )}
            {iso_country == N_A_VALUE && (
               <>
                  <h3 className="text-gray-400 font-bold">
                     ISO Country: {iso_country}{' '}
                     {lookup?.countries({ alpha2: iso_country })[0]?.emoji}
                  </h3>
                  <h3 className="text-gray-400 font-bold">
                     Country:{' '}
                     {lookup?.countries({ alpha2: iso_country })[0]?.name}{' '}
                     {lookup?.countries({ alpha2: iso_country })[0]?.emoji}
                  </h3>
               </>
            )}
            {iso_region == N_A_VALUE && (
               <h3 className="text-gray-400 font-bold">
                  ISO Region: {iso_region}
               </h3>
            )}
            {municipality == N_A_VALUE && (
               <h3 className="text-gray-400 font-bold">
                  Municipality: {municipality}
               </h3>
            )}
         </div>
         {iata_code == N_A_VALUE && (
            <p className="text-gray-400">IATA Code: {iata_code}</p>
         )}
         {ident == N_A_VALUE && <p className="text-gray-400">IDENT: {ident}</p>}
         {local_code == N_A_VALUE && (
            <p className="text-gray-400">Local Code: {local_code}</p>
         )}
         {description == N_A_VALUE && (
            <p className="text-gray-400">Description: {description}</p>
         )}
         <div className="mb-2 mt-2">
            {longitude_deg == N_A_VALUE && (
               <p className="text-gray-400">Longitude: {longitude_deg}</p>
            )}{' '}
            {latitude_deg == N_A_VALUE && (
               <p className="text-gray-400">Latitude: {latitude_deg}</p>
            )}
            {elevation_ft == N_A_VALUE && (
               <p className="text-gray-400">Elevation: {elevation_ft}</p>
            )}
            {length_ft == N_A_VALUE && (
               <p className="text-gray-400">Length: {length_ft}</p>
            )}
            {width_ft == N_A_VALUE && (
               <p className="text-gray-400">Width: {width_ft}</p>
            )}
         </div>
         {closed == N_A_VALUE && (
            <p className="text-gray-400">Closed: {closed}</p>
         )}
         {frequency_mhz == N_A_VALUE && (
            <p className="text-gray-400">Frequency: {frequency_mhz}</p>
         )}
         {gps_code == N_A_VALUE && (
            <p className="text-gray-400">GPS Code: {gps_code}</p>
         )}
         {lighted == N_A_VALUE && (
            <p className="text-gray-400">Lighted: {lighted}</p>
         )}{' '}
         {scheduled_service == N_A_VALUE && (
            <p className="text-gray-400">
               Scheduled Service: {scheduled_service}
            </p>
         )}
         {surface == N_A_VALUE && (
            <p className="text-gray-400">Surface: {surface}</p>
         )}
      </div>
   )
}
