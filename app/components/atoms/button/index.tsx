import React, { ReactNode } from 'react'

export function Button({
   onClick,
   path,
   message,
}: {
   onClick: () => void
   path: ReactNode
   message: string
}) {
   const handleClick = () => {
      onClick()
   }

   return (
      <button
         type="button"
         onClick={handleClick}
         className="ms-auto -mx-1.5 -my-1.5 justify-center h-10 w-10 p-2.5 bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-xl text-center inline-flex items-center text-white"
         aria-label={message}
      >
         <svg
            className="w-5 h-5"
            viewBox="0 0 1024 1024"
            version="1.1"
            aria-hidden="true"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
         >
            {path}
         </svg>
         <span className="sr-only">{message}</span>
      </button>
   )
}
