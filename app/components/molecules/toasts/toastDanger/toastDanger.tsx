import React from 'react'
import { useToast } from '@/app/context/toastsContext'
import { CloseButton } from '@/app/components/molecules/closeButton/closeButton'

export function ToastDanger({
   message,
   isClosable = true,
   closeCallBack,
}: {
   message: string
   isClosable?: boolean
   closeCallBack?: () => void
}) {
   const { setDangerToastIsDisplayed } = useToast()

   const handleCloseButtonClick = (): void => {
      setDangerToastIsDisplayed(false) // Close the danger toast.
      if (closeCallBack) closeCallBack()
   }

   return (
      <div
         id="toast-danger"
         className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-700/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5 rounded-lg shadow z-50"
         role="alert"
      >
         <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-300 rounded-lg">
            <svg
               className="w-5 h-5"
               aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg"
               fill="currentColor"
               viewBox="0 0 20 20"
            >
               <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
            </svg>
            <span className="sr-only">Error icon</span>
         </div>
         <div className="ms-3 text-sm font-normal">{message}</div>
         {isClosable && <CloseButton onClick={handleCloseButtonClick} />}
      </div>
   )
}
