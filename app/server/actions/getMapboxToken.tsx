'use server'

/**
 * Retrieves Mapbox token from env variable.
 */
export async function getMapboxToken(): Promise<any> {
   require('dotenv').config()
   return process.env.SECRET_PUBLIC_MAPBOX_TOKEN
}
