import { ReactNode, useCallback, useRef, useState } from 'react'

export function FadeInOut({
                             isVisible,
                             preFadeOutCallback,
                             children,
                          }: {
   isVisible: boolean
   preFadeOutCallback?: () => void
   children: ReactNode
}) {
   const [mounted, setMounted] = useState(isVisible)
   const prevVisibleRef = useRef(isVisible)

   if (isVisible && !prevVisibleRef.current) {
      setMounted(true)
   }
   prevVisibleRef.current = isVisible

   const handleAnimationStart = useCallback(() => {
      if (!isVisible) {
         preFadeOutCallback?.()
      }
   }, [isVisible, preFadeOutCallback])

   const handleAnimationEnd = useCallback(() => {
      if (!isVisible) {
         setMounted(false)
      }
   }, [isVisible])

   if (!mounted) return null

   return (
      <div
         className={`contents ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}
         onAnimationStart={handleAnimationStart}
         onAnimationEnd={handleAnimationEnd}
      >
         {children}
      </div>
   )
}
