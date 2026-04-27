export function formatDistanceLabel(distanceKm: number): string {
   if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`
   }

   return `${distanceKm.toFixed(1)} km`
}