'use server'
const ORS_API_URL: string =
   'https://api.openrouteservice.org/geocode/autocomplete'
const ORS_TOKEN: string = process.env.ORS_API_KEY ?? ''

export const autocomplete = async (text: string): Promise<any> => {
   try {
      const response: Response = await fetch(
         `${ORS_API_URL}?api_key=${ORS_TOKEN}&text=${encodeURIComponent(text)}&size=20`,
      )

      if (!response.ok) {
         throw new Error('Failed to fetch data')
      }

      return await response.json()
   } catch (error: any) {
      throw new Error(`autocomplete: Failed to fetch data ${error.message}`)
   }
}
