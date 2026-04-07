'use server'

// TODO : Search and explain if necessary ? why can't i just use process.env.SECRET_PUBLIC_MAPBOX_TOKEN ?? as used in flickrServices for example. Past me was an idiot ?
/**
 * Retrieves Mapbox token from env variable.
 */
export async function getMapboxToken(): Promise<any> {
   require('dotenv').config()
   return process.env.SECRET_PUBLIC_MAPBOX_TOKEN
}
