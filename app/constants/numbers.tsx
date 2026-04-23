import { OpenSkyBoundingBox } from '@/app/types/openSky/openSkyBoundingBox'

export const SPHERICAL_SCENE_TYPE = 0
export const PLANE_SCENE_TYPE = 1

/**
 * Earth radius in meters.
 */
export const EARTH_RADIUS: number = 6371008

/**
 *
 */
export const SUN_RADIUS: number = 696_340_000

/**
 * Earth radius in semi-major axis A as defined in WGS84.
 */
export const EARTH_RADIUS_A = 6378137.0

/**
 * Earth radius in semi-minor axis B as defined in WGS84.
 */
export const EARTH_RADIUS_B = 6356752.314245

/**
 * Earth equator perimeter in meters.
 */
export const EARTH_PERIMETER: number = 2 * Math.PI * EARTH_RADIUS

/**
 * Earth demi equator perimeter in meters.
 */
export const EARTH_ORIGIN: number = EARTH_PERIMETER / 2.0

/**
 *
 */
export const SPHERE_TO_PLANE_TOGGLE_DISTANCE: number = 1e6

/**
 * Max astres names scale factor.
 */
export const SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MAX_SCALE: number = 5

/**
 * Min astres names scale factor.
 */
export const SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MIN_SCALE: number = 0.001

/**
 *
 */
export const SPHERE_TO_PLANE_TRANSITION_TOGGLE_DISTANCE: number = 1e6 * 0.8

/**
 * Max distance possible from spherical earth.
 */
export const MAX_EARTH_DISTANCE_GLOBE_SCENE: number = EARTH_RADIUS + 2e7

/**
 * Min distance possible from spherical earth.
 */
export const MIN_EARTH_DISTANCE_GLOBE_SCENE: number = EARTH_RADIUS + 1e5

/**
 *
 */
export const SOLAR_SYSTEM_TOGGLE_DISTANCE: number = MAX_EARTH_DISTANCE_GLOBE_SCENE - 2e2

/**
 *
 */
export const SOLAR_SYSTEM_TO_GLOBE_TOGGLE_DISTANCE: number = EARTH_RADIUS * 2.01


/**
 * Max distance possible from solar system.
 */
export const MAX_SOLAR_SYSTEM_DISTANCE: number = SUN_RADIUS * 1e3


export const GLOBE_SCENE_ATMOSPHERE_SPHERE_SCALE: number = 1.1
export const PLANE_SCENE_ATMOSPHERE_SPHERE_SCALE: number = 1e5
export const PLANE_SCENE_VESSEL_MIN_SCALE: number = 5
export const PLANE_SCENE_VESSEL_MAX_SCALE: number = 400
export const GLOBE_SCENE_VESSEL_MIN_SCALE: number = 4e2
export const GLOBE_SCENE_VESSEL_MAX_SCALE: number = 5e3
export const MIN_WINDOW_WIDTH: number = 830
export const OUTER_SPACE_RADIUS: number = EARTH_RADIUS * 1e18
export const EARTH_ANGLE: number = -60
export const SPHERE_WIDTH_SEGMENTS: number = 90
export const SPHERE_HEIGHT_SEGMENTS: number = 45
export const PLANET_RESOLUTION_FACTOR: number = 10
export const PLANET_DISPLACEMENT_SCALE: number = 0.03
export const AIRPORT_SCALE: number = 10000

/**
 * Upper bound for plane meshes rendered at once so the scene stays responsive.
 */
export const MAX_DISPLAYED_PLANES: number = 1200

/**
 * Minimum plane mesh scale used on the spherical scene when zoomed out.
 */
export const GLOBE_PLANE_MIN_SCALE: number = 2000

/**
 * Maximum plane mesh scale used on the spherical scene when zoomed in.
 */
export const GLOBE_PLANE_MAX_SCALE: number = 3000

/**
 * Minimum plane mesh scale used on the planar scene when the camera is close.
 */
export const PLANE_SCENE_PLANE_MIN_SCALE: number = 1000

/**
 * Maximum plane mesh scale used on the planar scene when the camera is far.
 */
export const PLANE_SCENE_PLANE_MAX_SCALE: number = 4000

/**
 * Small vertical lift applied to spherical plane positions to avoid z-fighting.
 */
export const GLOBE_ALTITUDE_OFFSET_METERS: number = 5e4

/**
 * Cone geometry radius used when the GLB plane model cannot be loaded.
 */
export const PLANE_FALLBACK_CONE_RADIUS: number = 1

/**
 * Cone geometry height used when the GLB plane model cannot be loaded.
 */
export const PLANE_FALLBACK_CONE_HEIGHT: number = 3

/**
 * Cone geometry radial segments used when the GLB plane model cannot be loaded.
 */
export const PLANE_FALLBACK_CONE_RADIAL_SEGMENTS: number = 8

/**
 * Rotation applied to the fallback cone so it points like a plane mesh.
 */
export const PLANE_FALLBACK_CONE_ROTATION_X: number = Math.PI / 2

/**
 * Nombre maximal de navires affichés.
 */
export const MAX_DISPLAYED_VESSELS: number = 5e3

/**
 * Distance minimale pour l'affichage des navires sur le planisphère.
 */
export const PLANE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA: number = 1e6

/**
 * Distance minimale pour l'affichage des navires sur le globe.
 */
export const GLOBE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA: number =
   EARTH_RADIUS * 0.5

/**
 * Distance minimale pour l'affichage des aéroports sur le planisphère.
 */
export const PLANE_MIN_ALLOWED_AIRPORT_DISTANCE_TO_CAMERA: number = 1e2

export const SELECTED_COUNTRY_FRONTIERS_WIDTH: number = EARTH_RADIUS / 2e2
export const PLANE_SCENE_COUNTRY_FRONTIERS_MAX_THRESHOLD_BEFORE_REMOVED: number = 5e3
export const PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE: number = 0.5
export const PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE: number = 0.01

export const GLOBE_SCENE_COUNTRY_FRONTIERS_WIDTH: number = EARTH_RADIUS / 8e2
export const GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE: number = 2.5
export const GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE: number = 0.5

/**
 * Plane Puck size.
 */
export const PLANE_SCENE_PUCK_MIN_SCALE: number = 10
export const PLANE_SCENE_PUCK_MAX_SCALE: number = EARTH_RADIUS * 0.01

/**
 * Globe Puck size.
 */
export const GLOBE_SCENE_PUCK_MIN_SCALE: number = EARTH_RADIUS / 6e3
export const GLOBE_SCENE_PUCK_MAX_SCALE: number = EARTH_RADIUS * 0.03


/**
 * Plane Airport size.
 */
export const PLANE_SCENE_AIRPORT_MIN_SCALE: number = 100
export const PLANE_SCENE_AIRPORT_MAX_SCALE: number = 3e3

/**
 *
 */
export const MAX_LIST_PREVIEW_COUNT = 6

export const DEFAULT_BBOX: OpenSkyBoundingBox = {
   lamin: 43,
   lomin: -3,
   lamax: 52,
   lomax: 8,
}

export const MIN_LATITUDE = -90
export const MAX_LATITUDE = 90
export const MIN_LONGITUDE = -180
export const MAX_LONGITUDE = 180
export const MAX_LATITUDE_SPAN = 16
export const MAX_LONGITUDE_SPAN = 24

export const STATES_TTL_ANONYMOUS_MS = 30_000
export const STATES_TTL_AUTHENTICATED_MS = 12_000
export const TRACK_TTL_MS = 60_000
export const STALE_GRACE_MS = 5 * 60_000