'use client'
import React from 'react'
import {
   NO_ERROR_MESSAGE,
   SAFARI_OR_CHROME_ERROR_MESSAGE,
   WAITING_TO_DETECT_ERROR_MESSAGE,
   WINDOW_WIDTH_ERROR_MESSAGE,
} from '@/app/constants/strings'
import { MIN_WINDOW_WIDTH } from '@/app/constants/numbers'


export function ErrorSecurity({
                                 children,
                              }: Readonly<{
   children: React.ReactNode
}>) {
   let errorMessage: string =
      WAITING_TO_DETECT_ERROR_MESSAGE

   /**
    * Check screen width.
    */
   const handleResize = (): void => {
      const isSafariOrChrome: boolean = /(safari|chrome|android|crios)/i.test(
         navigator.userAgent,
      )

      if (isSafariOrChrome) {
         errorMessage = SAFARI_OR_CHROME_ERROR_MESSAGE
      } else if (window.innerWidth < MIN_WINDOW_WIDTH) {
         errorMessage = WINDOW_WIDTH_ERROR_MESSAGE
      } else {
         errorMessage = NO_ERROR_MESSAGE
      }
   }


   // Check on initial render.
   handleResize()

   // Executed when window is resized.
   window.addEventListener('resize', handleResize)


   return (
      <main className="flex min-h-screen h-full flex-col items-center justify-between">
         {errorMessage != NO_ERROR_MESSAGE ? (
            <div
               id="toast-danger"
               className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center w-full max-w-lg p-4 mb-4 text-white bg-red-700/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5 rounded-lg shadow z-50"
               role="alert"
            >
               <div
                  className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-300 rounded-lg">
                  <svg
                     className="w-5 h-5"
                     aria-hidden="true"
                     xmlns="http://www.w3.org/2000/svg"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                  </svg>
                  <span className="sr-only">Error icon</span>
               </div>
               <div className="ms-3 text-sm font-normal">{errorMessage}</div>
            </div>
         ) : <>{children}</>
         }
      </main>
   )
}
