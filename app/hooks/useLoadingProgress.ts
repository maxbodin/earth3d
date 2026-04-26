import { useSyncExternalStore } from 'react'
import { LoadingSnapshot, LoadingTracker } from '@/app/lib/loadingTracker'

/**
 * Observes application startup loading progress.
 *
 * Uses useSyncExternalStore for concurrent-safe, useEffect-free subscription
 * to the LoadingTracker external store.
 */
export function useLoadingProgress(): LoadingSnapshot {
  return useSyncExternalStore(
    LoadingTracker.subscribe.bind(LoadingTracker),
    LoadingTracker.getSnapshot.bind(LoadingTracker),
    LoadingTracker.getServerSnapshot.bind(LoadingTracker),
  )
}
