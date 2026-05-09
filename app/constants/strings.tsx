/**
 * Names
 */
export const PLANE_SCENE_NAME: string = 'Plane Scene'
export const GLOBE_SCENE_NAME: string = 'Globe Scene'
export const SOLAR_SYSTEM_SCENE_NAME: string = 'Solar System Scene'
export const PLANET_NAME: string = 'Planet'
export const CONSTELLATION_BOUNDS_NAME: string = 'Constellation Bounds'
export const PLANE_SCENE_SKY_NAME: string = 'Plane Scene Sky'
export const GLOBE_SCENE_ATMOSPHERE_NAME: string = 'Globe Scene Atmosphere'
export const MILKY_WAY_NAME: string = 'Milky Way'
export const HYPTIC_NAME: string = 'Hyptic'
export const CONSTELLATION_FIGURES_NAME: string = 'Constellation Figures'
export const TAB_TITLES: string[] = [
   'Planes',
   'Airports',
   'Vessels',
   'Earthquakes',
   'Volcanoes',
   'Map',
   'Outer Space',
   'Countries',
   'Solar System',
]

/**
 * Errors Messages.
 */
export const WEBGL_ERROR_MESSAGE: string =
   'Earth 3D could not detect a compatible WebGL context. '
   + 'Please enable hardware acceleration or try a modern browser with WebGL support.'

export const WINDOW_WIDTH_ERROR_MESSAGE: string =
   'Screen width is not supported. Please use a larger screen.'
export const WAITING_TO_DETECT_ERROR_MESSAGE: string =
   'Waiting for possible errors...'
export const NO_ERROR_MESSAGE: string = 'No error detected.'

/**
 * Various.
 */
export const N_A_VALUE: string = 'N/A'

// TODO export const CYCLOSM_MAP_LINK: string = `https://{s}.tile-cyclosm.openstreetmap.fr/[cyclosm|cyclosm-lite]/{z}/{x}/{y}.png`

/**
 * // TODO ADD URLs
 */

export const COUNTRY_PROFILE_API_BASE_PATH = '/api/country-profile'

export const PLANE_STATES_API_PATH = '/api/planes/states'
export const PLANE_TRACK_API_BASE_PATH = '/api/planes/tracks'

export const EARTHQUAKE_API_PATH = '/api/earthquakes'

export const OPEN_SKY_API_BASE_URL = 'https://opensky-network.org/api'
export const OPEN_SKY_TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token'

export const VOLCANO_API_PATH = '/api/volcanoes'

export const EARTHQUAKE_HEATMAP_NAME: string = 'EARTHQUAKE_HEATMAP'
export const TECTONIC_PLATES_NAME: string = 'TECTONIC_PLATES'