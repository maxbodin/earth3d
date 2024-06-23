import React, { ReactNode } from 'react'

export function Button({
                          onClick,
                          svg,
                          message,
                       }: {
   onClick: () => void
   svg: ReactNode
   message: string
}) {
   const handleClick = (): void => {
      onClick()
   }

   return (
      <button
         type="button"
         onClick={handleClick}
         className="mr-1.5 ml-1.5 justify-center h-10 w-10 p-2.5 bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-xl text-center inline-flex items-center text-white"
         aria-label={message}
      >
         {svg}
         <span className="sr-only">{message}</span>
      </button>
   )
}
