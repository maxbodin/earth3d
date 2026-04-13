export const DEFAULT_MAP_STYLE_ID = 'mapbox.satellite'

export const CLASSIC_STREETS_STYLE_ID = 'mapbox.mapbox-streets-v8'

export const MAPBOX_STYLE_URL_PREFIX = 'mapbox://styles/'

export const MAPBOX_STATIC_TILES_TILE_SIZE = 512

export function isMapboxStyleUrl(styleId: string): boolean {
   return styleId.startsWith(MAPBOX_STYLE_URL_PREFIX)
}

export function parseMapboxStyleUrl(
   styleUrl: string,
): { username: string; styleId: string } | null {
   if (!isMapboxStyleUrl(styleUrl)) {
      return null
   }

   const [username, ...styleIdSegments] = styleUrl
      .slice(MAPBOX_STYLE_URL_PREFIX.length)
      .split('/')

   if (!username || styleIdSegments.length === 0) {
      return null
   }

   return {
      username,
      styleId: styleIdSegments.join('/'),
   }
}