import { CacheEntry } from '@/app/types/cacheEntry'
import { STALE_GRACE_MS } from '@/app/constants/numbers'

export function toCacheEntry<T>(payload: T, ttlMs: number): CacheEntry<T> {
   const fetchedAt = Date.now()

   return {
      payload,
      fetchedAt,
      ttlMs,
      staleUntil: fetchedAt + ttlMs + STALE_GRACE_MS,
   }
}