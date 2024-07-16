'use client'
import React, { useEffect, useState } from 'react'
import { ToastDanger } from '@/app/components/molecules/toasts/toastDanger/toastDanger'
import { MIN_WINDOW_WIDTH } from '@/app/constants/numbers'
import {
   NO_ERROR_MESSAGE,
   SAFARI_OR_CHROME_ERROR_MESSAGE,
   WAITING_TO_DETECT_ERROR_MESSAGE,
   WINDOW_WIDTH_ERROR_MESSAGE,
} from '@/app/constants/strings'

export function ErrorSecurity({
                                 children,
                              }: Readonly<{
   children: React.ReactNode
}>) {
   const [errorMessage, setErrorMessage] = useState(
      WAITING_TO_DETECT_ERROR_MESSAGE,
   )

   /**
    * Check screen width.
    */
   const handleResize = (): void => {
      if (window.innerWidth < MIN_WINDOW_WIDTH) {
         setErrorMessage(WINDOW_WIDTH_ERROR_MESSAGE)
      } else {
         setErrorMessage(NO_ERROR_MESSAGE)
      }
   }

   useEffect(() => {
      const isSafariOrChrome: boolean = /(safari|chrome|android|crios)/i.test(
         navigator.userAgent,
      )

      if (isSafariOrChrome) {
         setErrorMessage(SAFARI_OR_CHROME_ERROR_MESSAGE)
         return
      }

      // Check on initial render.
      handleResize()

      // Executed when window is resized.
      window.addEventListener('resize', handleResize)

      return (): void => {
         window.removeEventListener('resize', handleResize)
      }
   }, [errorMessage])

   return (
      <main className="flex min-h-screen h-full flex-col items-center justify-between">
         {errorMessage != NO_ERROR_MESSAGE && (
            <ToastDanger message={errorMessage} isClosable={false} />
         )}
         {errorMessage == NO_ERROR_MESSAGE && <>{children}</>}
      </main>
   )
}
