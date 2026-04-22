export function parseTrackTime(searchParams: URLSearchParams): number {
   const rawTime = searchParams.get('time')
   if (rawTime == null) return 0

   const parsedTime = Number(rawTime)
   return Number.isFinite(parsedTime) ? parsedTime : 0
}