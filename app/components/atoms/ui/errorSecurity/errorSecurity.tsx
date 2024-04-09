'use client'
import React, { useEffect, useState } from 'react'
import { ToastDanger } from '@/app/components/molecules/toasts/toastDanger/toastDanger'
import { MIN_WINDOW_WIDTH } from '@/app/constants/numbers'
import {
   NO_ERROR_MESSAGE,
   RESIZE_LISTENER_STRING,
   SAFARI_ERROR_MESSAGE,
   WAITING_TO_DETECT_ERROR_MESSAGE,
   WINDOW_WIDTH_ERROR_MESSAGE,
} from '@/app/constants/strings'

export function ErrorSecurity({
   children,
}: Readonly<{
   children: React.ReactNode
}>) {
   const [errorMessage, setErrorMessage] = useState(
      WAITING_TO_DETECT_ERROR_MESSAGE
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
      const isSafari: boolean = /^((?!chrome|android).)*safari/i.test(
         navigator.userAgent
      )

      if (isSafari) {
         setErrorMessage(SAFARI_ERROR_MESSAGE)
         return
      }

      // Check on initial render.
      handleResize()

      // Executed when window is resized.
      window.addEventListener(RESIZE_LISTENER_STRING, handleResize)

      return (): void => {
         window.removeEventListener(RESIZE_LISTENER_STRING, handleResize)
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
