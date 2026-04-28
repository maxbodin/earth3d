export function formatEpochToLocale(epoch: number): string {
   return new Date(epoch).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   })
}