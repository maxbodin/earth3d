'use client'
import { useState, useCallback, Dispatch, SetStateAction } from 'react'

function readFromStorage<T>(key: string, fallback: T): T {
   if (typeof window === 'undefined') return fallback
   try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : fallback
   } catch {
      return fallback
   }
}

function writeToStorage<T>(key: string, value: T): void {
   try {
      localStorage.setItem(key, JSON.stringify(value))
   } catch {
      // Storage full or unavailable, silently degrade.
   }
}

export function useLocalStorageState<T>(
   key: string,
   defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
   const [state, setStateRaw] = useState<T>(() => readFromStorage(key, defaultValue))

   const setState: Dispatch<SetStateAction<T>> = useCallback(
      (action: SetStateAction<T>) => {
         setStateRaw((prev) => {
            const next = action instanceof Function ? action(prev) : action
            writeToStorage(key, next)
            return next
         })
      },
      [key],
   )

   return [state, setState]
}
