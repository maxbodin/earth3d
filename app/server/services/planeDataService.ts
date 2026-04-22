import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { PlaneStatesApiResponse } from '@/app/types/plane/planeStatesApiResponse'
import { OpenSkyTrackResponse } from '@/app/types/openSky/openSkyTrackResponse'
import { PlaneTrackApiResponse } from '@/app/types/plane/planeTrackApiResponse'
import { PLANE_STATES_API_PATH, PLANE_TRACK_API_BASE_PATH } from '@/app/constants/strings'

function buildStatesApiUrl(bbox: OpenSkyBoundingBox): string {
   const query = new URLSearchParams({
      lamin: `${bbox.lamin}`,
      lomin: `${bbox.lomin}`,
      lamax: `${bbox.lamax}`,
      lomax: `${bbox.lomax}`,
      extended: '1',
   })

   return `${PLANE_STATES_API_PATH}?${query.toString()}`
}

export async function fetchPlanesData(
   bbox: OpenSkyBoundingBox,
): Promise<OpenSkyStateVector[]> {
   const response = await fetch(buildStatesApiUrl(bbox), {
      cache: 'no-store',
   })

   if (!response.ok) {
      throw new Error(`fetchPlanesData: Request failed with status ${response.status}.`)
   }

   const payload = (await response.json()) as PlaneStatesApiResponse
   return payload.states ?? []
}

// TODO : Add Usage.
export async function fetchPlaneTrackData(
   icao24: string,
): Promise<OpenSkyTrackResponse | null> {
   const normalizedIcao24 = icao24.trim().toLowerCase()
   if (normalizedIcao24.length === 0) return null

   const response = await fetch(
      `${PLANE_TRACK_API_BASE_PATH}/${encodeURIComponent(normalizedIcao24)}?time=0`,
      {
         cache: 'no-store',
      },
   )

   if (!response.ok) {
      throw new Error(`fetchPlaneTrackData: Request failed with status ${response.status}.`)
   }

   const payload = (await response.json()) as PlaneTrackApiResponse
   return payload.track
}
