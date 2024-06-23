import { Color, Vector2, Vector3 } from 'three'
import { EARTH_ORIGIN } from '@/app/constants/numbers'

/**
 * Geolocation is used to represent a position in earth using WGS84 Datum units.
 */
export class Geolocation {
   /**
    * Latitude in degrees. Range from -90° to 90°.
    */
   public latitude: number

   /**
    * Latitude in degrees. Range from -180° to 180°.
    */
   public longitude: number

   public constructor(latitude: number, longitude: number) {
      this.latitude = latitude
      this.longitude = longitude
   }
}

/**
 * Units utils contains methods to convert data between representations.
 *
 * Multiple methods are used to reprent world coordinates based on the type of data being presented.
 *
 * WGS84 is the most commonly used representation with (latitude, longitude, altitude).
 *
 * EPSG:900913 is used for planar coordinates in (X, Y, Z)
 */
export class ThreeGeoUnitsUtils {
   /**
    * Converts coordinates from WGS84 Datum to XY in Spherical Mercator EPSG:900913.
    *
    * @param latitude - Latitude value in degrees.
    * @param longitude - Longitude value in degrees.
    */
   public static datumsToSpherical(
      latitude: number,
      longitude: number,
   ): Vector2 {
      const x: number = (longitude * EARTH_ORIGIN) / 180.0
      let y: number =
         Math.log(Math.tan(((90 + latitude) * Math.PI) / 360.0)) /
         (Math.PI / 180.0)

      y = (y * EARTH_ORIGIN) / 180.0

      return new Vector2(x, y)
   }

   /**
    * Converts XY point from Spherical Mercator EPSG:900913 to WGS84 Datum.
    *
    * @param x - X coordinate.
    * @param y - Y coordinate.
    */
   public static sphericalToDatums(x: number, y: number): Geolocation {
      const longitude: number = (x / EARTH_ORIGIN) * 180.0
      let latitude: number = (y / EARTH_ORIGIN) * 180.0

      latitude =
         (180.0 / Math.PI) *
         (2 * Math.atan(Math.exp((latitude * Math.PI) / 180.0)) - Math.PI / 2.0)

      return new Geolocation(latitude, longitude)
   }

   /**
    * Converts quad tree zoom/x/y to lat/lon in WGS84 Datum.
    *
    * The X and Y start from 0 from the top/left corner of the quadtree up to (4^zoom - 1)
    *
    * @param zoom - Zoom level of the quad tree.
    * @param x - X coordinate.
    * @param y - Y coordinate.
    */
   public static quadtreeToDatums(
      zoom: number,
      x: number,
      y: number,
   ): Geolocation {
      const n: number = Math.pow(2.0, zoom)
      const longitude: number = (x / n) * 360.0 - 180.0
      const latitudeRad: number = Math.atan(
         Math.sinh(Math.PI * (1.0 - (2.0 * y) / n)),
      )
      const latitude: number = 180.0 * (latitudeRad / Math.PI)

      return new Geolocation(latitude, longitude)
   }

   /**
    * Direction vector to WGS84 coordinates.
    *
    * Can be used to transform surface points of world sphere to coordinates.
    *
    * @param dir - Direction vector.
    * @returns WGS84 coordinates.
    */
   public static vectorToDatums(dir: Vector3): Geolocation {
      const radToDeg: number = 180 / Math.PI

      const latitude: number =
         Math.atan2(
            dir.y,
            Math.sqrt(Math.pow(dir.x, 2) + Math.pow(-dir.z, 2)),
         ) * radToDeg
      const longitude: number = Math.atan2(-dir.z, dir.x) * radToDeg

      return new Geolocation(latitude, longitude)
   }

   /**
    * Get a direction vector from WGS84 coordinates.
    *
    * The vector obtained will be normalized.
    *
    * @param latitude - Latitude value in degrees.
    * @param longitude - Longitude value in degrees.
    * @returns Direction vector normalized.
    */
   public static datumsToVector(latitude: number, longitude: number): Vector3 {
      const degToRad: number = Math.PI / 180

      const rotX: number = longitude * degToRad
      const rotY: number = latitude * degToRad

      var cos: number = Math.cos(rotY)

      return new Vector3(
         -Math.cos(rotX + Math.PI) * cos,
         Math.sin(rotY),
         Math.sin(rotX + Math.PI) * cos,
      )
   }

   /**
    * Get altitude from RGB color for mapbox altitude encoding
    *
    * https://docs.mapbox.com/data/tilesets/guides/access-elevation-data/~
    *
    * @param color - Color of the pixel
    * @returns The altitude encoded in meters.
    */
   public static mapboxAltitude(color: Color): number {
      return (
         (color.r * 255.0 * 65536.0 +
            color.g * 255.0 * 256.0 +
            color.b * 255.0) *
         0.1 -
         10000.0
      )
   }
}
