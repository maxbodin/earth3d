const SEARCH_PARAM_PRECISION = 6

export function serializeCoordinate(value: number): string {
   return value.toFixed(SEARCH_PARAM_PRECISION)
}