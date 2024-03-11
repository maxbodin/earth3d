import React from 'react'
import { Link } from '@/app/components/atoms/link'
import {
   getContinentEmoji,
   getContinentString,
   getTypeString,
} from '@/app/helpers/commonHelper'

const lookup = require('country-data').lookup

export function AirportData({
   selectedAirportData,
}: {
   selectedAirportData: Record<string, any>
}) {
   const data = selectedAirportData?.data

   if (data == null)
      return (
         <>
            <h1>Failed to get data.</h1>
         </>
      )

   const name = data.name || 'N/A'
   const type = data.type || 'N/A'
   const continent = data.continent || 'N/A'
   const description = data.description || 'N/A'
   const latitude_deg = data.latitude_deg?.toFixed(3) || 'N/A'
   const longitude_deg = data.longitude_deg?.toFixed(3) || 'N/A'
   const elevation_ft = data.elevation_ft || 'N/A'
   const closed = data.closed || 'N/A'
   const frequency_mhz = data.frequency_mhz || 'N/A'
   const gps_code = data.gps_code || 'N/A'
   const home_link = data.home_link || 'N/A'
   const iata_code = data.iata_code || 'N/A'
   const ident = data.ident || 'N/A'
   const iso_country = data.iso_country || 'N/A'
   const iso_region = data.iso_region || 'N/A'
   const length_ft = data.length_ft || 'N/A'
   const lighted = data.lighted || 'N/A'
   const local_code = data.local_code || 'N/A'
   const municipality = data.municipality || 'N/A'
   const scheduled_service = data.scheduled_service || 'N/A'
   const surface = data.surface || 'N/A'
   const width_ft = data.width_ft || 'N/A'
   const wikipedia_link = data.wikipedia_link || 'N/A'

   console.log(lookup?.countries({ alpha2: iso_country })[0])
   return (
      <div>
         {name != 'N/A' && (
            <h2 className="text-white text-2xl font-bold mb-2">
               Name: {name}{' '}
            </h2>
         )}
         {type != 'N/A' && (
            <h2 className="text-white text-xl font-bold mb-2">
               Type: {getTypeString(type)}{' '}
            </h2>
         )}
         <div className="mb-4">
            {continent != 'N/A' && (
               <div className="flex items-center">
                  <h3 className="text-white text-lg font-bold">
                     Continent: {getContinentString(continent)}{' '}
                     {getContinentEmoji(continent)}
                  </h3>
               </div>
            )}
            {iso_country != 'N/A' && (
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
            {iso_region != 'N/A' && (
               <h3 className="text-white font-bold">
                  ISO Region: {iso_region}
               </h3>
            )}
            {municipality != 'N/A' && (
               <h3 className="text-white font-bold">
                  Municipality: {municipality}
               </h3>
            )}
         </div>
         <div className="mb-2">
            {iata_code != 'N/A' && (
               <p className="text-white">IATA Code: {iata_code}</p>
            )}
            {ident != 'N/A' && (
               <>
                  <p className="text-white">IDENT: {ident}</p>
                  <Link
                     link={`https://metar-taf.com/${ident}`}
                     title={`METAR-TAF ${ident}`}
                  />
               </>
            )}
            {local_code != 'N/A' && (
               <p className="text-white">Local Code: {local_code}</p>
            )}
         </div>
         {description != 'N/A' && (
            <p className="text-white mb-2">Description: {description}</p>
         )}
         <div className="mb-2">
            <p className="text-gray-300">
               Longitude: {longitude_deg} Latitude: {latitude_deg}
            </p>
            {elevation_ft != 'N/A' && (
               <p className="text-gray-300">Elevation: {elevation_ft} feet</p>
            )}
            {length_ft != 'N/A' && (
               <p className="text-gray-300">
                  Length: {length_ft} feet Width: {width_ft} feet
               </p>
            )}
         </div>
         {closed != 'N/A' && (
            <p className="text-gray-300 mb-2">Closed: {closed}</p>
         )}
         {frequency_mhz != 'N/A' && (
            <p className="text-gray-300 mb-2">Frequency: {frequency_mhz} mhz</p>
         )}
         {gps_code != 'N/A' && (
            <p className="text-gray-300 mb-2">GPS Code: {gps_code}</p>
         )}
         {lighted != 'N/A' && (
            <p className="text-gray-300 mb-2">
               Lighted: {Boolean(lighted).toString()} {Boolean(lighted) && '💡'}
            </p>
         )}{' '}
         {scheduled_service != 'N/A' && (
            <p className="text-gray-300 mb-2">
               Scheduled Service: {scheduled_service}
            </p>
         )}
         {surface != 'N/A' && (
            <p className="text-gray-300 mb-2">Surface: {surface}</p>
         )}
         {home_link != 'N/A' && <Link link={home_link} title={'Home Link'} />}
         {wikipedia_link != 'N/A' && (
            <Link link={wikipedia_link} title={'Wikipedia Link'} />
         )}
         {
            // Fallback for N/A values here:
         }
         {name == 'N/A' && (
            <h2 className="text-gray-400 text-2xl font-bold mb-2">
               Name: {name}{' '}
            </h2>
         )}
         {type == 'N/A' && (
            <h2 className="text-gray-400 text-xl font-bold mb-2">
               Type: {getTypeString(type)}{' '}
            </h2>
         )}
         <div className="mb-4">
            {continent == 'N/A' && (
               <div className="flex items-center">
                  <h3 className="text-gray-400 text-lg font-bold">
                     Continent: {getContinentString(continent)}{' '}
                     {getContinentEmoji(continent)}
                  </h3>
               </div>
            )}
            {iso_country == 'N/A' && (
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
            {iso_region == 'N/A' && (
               <h3 className="text-gray-400 font-bold">
                  ISO Region: {iso_region}
               </h3>
            )}
            {municipality == 'N/A' && (
               <h3 className="text-gray-400 font-bold">
                  Municipality: {municipality}
               </h3>
            )}
         </div>
         {iata_code == 'N/A' && (
            <p className="text-gray-400">IATA Code: {iata_code}</p>
         )}
         {ident == 'N/A' && <p className="text-gray-400">IDENT: {ident}</p>}
         {local_code == 'N/A' && (
            <p className="text-gray-400">Local Code: {local_code}</p>
         )}
         {description == 'N/A' && (
            <p className="text-gray-400">Description: {description}</p>
         )}
         <div className="mb-2 mt-2">
            {longitude_deg == 'N/A' && (
               <p className="text-gray-400">Longitude: {longitude_deg}</p>
            )}{' '}
            {latitude_deg == 'N/A' && (
               <p className="text-gray-400">Latitude: {latitude_deg}</p>
            )}
            {elevation_ft == 'N/A' && (
               <p className="text-gray-400">Elevation: {elevation_ft}</p>
            )}
            {length_ft == 'N/A' && (
               <p className="text-gray-400">Length: {length_ft}</p>
            )}
            {width_ft == 'N/A' && (
               <p className="text-gray-400">Width: {width_ft}</p>
            )}
         </div>
         {closed == 'N/A' && <p className="text-gray-400">Closed: {closed}</p>}
         {frequency_mhz == 'N/A' && (
            <p className="text-gray-400">Frequency: {frequency_mhz}</p>
         )}
         {gps_code == 'N/A' && (
            <p className="text-gray-400">GPS Code: {gps_code}</p>
         )}
         {lighted == 'N/A' && (
            <p className="text-gray-400">Lighted: {lighted}</p>
         )}{' '}
         {scheduled_service == 'N/A' && (
            <p className="text-gray-400">
               Scheduled Service: {scheduled_service}
            </p>
         )}
         {surface == 'N/A' && (
            <p className="text-gray-400">Surface: {surface}</p>
         )}
      </div>
   )
}
