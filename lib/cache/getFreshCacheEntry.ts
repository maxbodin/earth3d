import { CacheEntry } from '@/app/types/cacheEntry'

export function getFreshCacheEntry<T>(
   cache: Map<string, CacheEntry<T>>,
   key: string,
): CacheEntry<T> | null {
   const entry = cache.get(key)
   if (entry == null) return null

   if (entry.fetchedAt + entry.ttlMs >= Date.now()) {
      return entry
   }

   return null
}