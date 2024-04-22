/**
 * Earth radius in meters.
 */
export const EARTH_RADIUS: number = 6371008

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

export const GLOBE_SCENE_ATMOSPHERE_SPHERE_SCALE: number = 1.1
export const PLANE_SCENE_ATMOSPHERE_SPHERE_SCALE: number = 1e5
export const PLANE_SCENE_VESSEL_MIN_SCALE: number = 10
export const PLANE_SCENE_VESSEL_MAX_SCALE: number = 400
export const GLOBE_SCENE_VESSEL_MIN_SCALE: number = 4e2
export const GLOBE_SCENE_VESSEL_MAX_SCALE: number = 5e3
export const MAX_DISPLAYED_VESSELS: number = 1e6
export const MIN_WINDOW_WIDTH: number = 830
export const OUTER_SPACE_RADIUS: number = EARTH_RADIUS * 1e18
export const EARTH_ANGLE: number = -60
export const SPHERE_WIDTH_SEGMENTS: number = 90
export const SPHERE_HEIGHT_SEGMENTS: number = 45
export const PLANET_RESOLUTION_FACTOR: number = 10
export const PLANET_DISPLACEMENT_SCALE: number = 0.03
export const ZOOM_THRESHOLD: number = EARTH_RADIUS * 1.3
export const AIRPORT_SCALE: number = 0.003
export const PLANE_SCALE: number = 0.001
export const PLANE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA: number = 1e6
export const GLOBE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA: number =
   EARTH_RADIUS * 1.3
export const SELECTED_COUNTRY_FRONTIERS_WIDTH: number = EARTH_RADIUS / 2e2

export const PLANE_SCENE_COUNTRY_FRONTIERS_MAX_THRESHOLD_BEFORE_REMOVED: number = 5e3
export const PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE: number = 0.5
export const PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE: number = 0.01

export const GLOBE_SCENE_COUNTRY_FRONTIERS_WIDTH: number = EARTH_RADIUS / 8e2
export const GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE: number = 2.5
export const GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE: number = 0.5
