export type CacheEntry<T> = {
   payload: T
   fetchedAt: number
   ttlMs: number
   staleUntil: number
}