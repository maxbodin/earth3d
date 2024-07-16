import React, { ReactNode, useEffect, useState } from 'react'
import '../../../../commonStyles/fadeIn.css'
import '../../../../commonStyles/fadeOut.css'

export function FadeInOut({
                             isVisible,
                             preFadeOutCallback,
                             children,
                          }: {
   isVisible: boolean
   preFadeOutCallback?: () => void
   children: ReactNode
}) {
   const [isRendering, setIsRendering] = useState(false)

   const duration: number = 1000

   useEffect(() => {
      let timeoutId: NodeJS.Timeout

      if (!isVisible) {
         if (preFadeOutCallback) {
            preFadeOutCallback()
         }
         // Ensure the component is visible for the fade-out animation.
         timeoutId = setTimeout((): void => {
            setIsRendering(false)
         }, duration)
      } else {
         setIsRendering(isVisible)
      }

      return (): void => {
         clearTimeout(timeoutId)
      }
   }, [isVisible])

   return (
      <>
         {isRendering && (
            <>
               {React.Children.map(children, (child: any) => {
                  return React.cloneElement(child, {
                     className:
                        child.props.className +
                        ` ${isVisible ? 'fade-in' : 'fade-out'}`,
                  })
               })}
            </>
         )}
      </>
   )
}
