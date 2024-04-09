'use server'
const openSkyNetworkApiBaseUrl: string = 'https://api.opensky-network.org/api'
// const corsUrl: string = 'https://cors-anywhere.herokuapp.com'

// TODO: Make similar system as for vessels.
export const fetchPlanesData = async (): Promise<any> => {
   try {
      const response: Response = await fetch(
         `${openSkyNetworkApiBaseUrl}/states/all?lamin=46&lamax=49&lomin=3&lomax=6`
      )
      if (!response.ok) {
         throw new Error('Failed to fetch data')
      }
      return await response.json()
   } catch (error: any) {
      throw new Error(`fetchPlanesData: Failed to fetch data ${error.message}`)
   }
}

export const fetchPlaneTrackData = async (icao24: string): Promise<any> => {
   try {
      const response: Response = await fetch(
         `${openSkyNetworkApiBaseUrl}/tracks/all?icao24=${icao24}&time=0`
      )
      if (!response.ok) {
         throw new Error('Failed to fetch data')
      }
      return await response.json()
   } catch (error: any) {
      throw new Error(
         `fetchPlaneTrackData: Failed to fetch data ${error.message}`
      )
   }
}
