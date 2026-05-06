export enum CursorModeType {
   HAND, // User is only moving the planet.
   POINTER, // User can select a place by clicking on the planet.
   DISTANCE, // User picks two points to measure distance.
}

export const CURSOR_MODE_DEFAULT: CursorModeType = CursorModeType.HAND