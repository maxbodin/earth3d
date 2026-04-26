'use client'
import React, { useEffect, useState } from 'react'
import {
   NO_ERROR_MESSAGE,
   WAITING_TO_DETECT_ERROR_MESSAGE,
   WEBGL_ERROR_MESSAGE,
   WINDOW_WIDTH_ERROR_MESSAGE,
} from '@/app/constants/strings'
import { MIN_WINDOW_WIDTH } from '@/app/constants/numbers'

const isWebGLAvailable = (): boolean => {
   if (typeof window === 'undefined') {
      return false
   }

   const canvas = document.createElement('canvas')

   return (
      Boolean(window.WebGL2RenderingContext && canvas.getContext('webgl2')) ||
      Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
   )
}

export function ErrorSecurity({
                                 children,
                              }: Readonly<{
   children: React.ReactNode
}>) {
   const [errorMessage, setErrorMessage] = useState<string>(
      WAITING_TO_DETECT_ERROR_MESSAGE,
   )

   useEffect((): (() => void) => {
      const evaluateEnvironment = (): void => {
         if (!isWebGLAvailable()) {
            setErrorMessage(WEBGL_ERROR_MESSAGE)
            return
         }

         if (window.innerWidth < MIN_WINDOW_WIDTH) {
            setErrorMessage(WINDOW_WIDTH_ERROR_MESSAGE)
            return
         }

         setErrorMessage(NO_ERROR_MESSAGE)
      }

      evaluateEnvironment()
      window.addEventListener('resize', evaluateEnvironment)

      return (): void => {
         window.removeEventListener('resize', evaluateEnvironment)
      }
   }, [])


   return (
      // TODO : Refactor in cleaner toast defined.
      <main className="relative flex min-h-screen h-full flex-col items-center justify-between">
         {children}

         {errorMessage !== NO_ERROR_MESSAGE && (
            <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
               <div
                  id="toast-danger"
                  className="flex w-full max-w-lg items-center rounded-lg bg-red-700/20 p-4 text-white shadow-lg ring-1 ring-black/5 backdrop-blur-md"
                  role="status"
               >
                  <div
                     className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-300 text-red-500"
                  >
                     <svg
                        className="h-5 w-5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                     </svg>
                     <span className="sr-only">Error icon</span>
                  </div>
                  <div className="ms-3 text-sm font-normal">{errorMessage}</div>
               </div>
            </div>
         )}
      </main>
   )
}
