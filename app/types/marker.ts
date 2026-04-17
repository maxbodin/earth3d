/**
 * Marker.
 */
export interface Marker {
   id: string,
   selection: string,
   name: string,
   showTitleOnMap: boolean,
   address: string,
   latitude: number,
   longitude: number,
   color: string
   actions: string
   isPuck: boolean
}
