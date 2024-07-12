import type React from 'react'
import { useEffect, useRef } from 'react'

/**
 *
 * @param ref
 */
export function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
   const innerRef = useRef<T>(null)

   useEffect((): void => {
      if (!ref) return
      if (typeof ref === 'function') {
         ref(innerRef.current)
      } else {
         ref.current = innerRef.current
      }
   })

   return innerRef
}