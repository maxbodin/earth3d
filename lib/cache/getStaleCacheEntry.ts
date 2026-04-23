import { CacheEntry } from '@/app/types/cacheEntry'

export function getStaleCacheEntry<T>(
   cache: Map<string, CacheEntry<T>>,
   key: string,
): CacheEntry<T> | null {
   const entry = cache.get(key)
   if (entry == null) return null

   return entry.staleUntil >= Date.now() ? entry : null
}