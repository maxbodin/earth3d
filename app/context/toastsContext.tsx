import React, { createContext, ReactNode, useContext, useState } from 'react'

interface ToastContextValue {
   dangerToastIsDisplayed: boolean
   setDangerToastIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>
   successToastIsDisplayed: boolean
   setSuccessToastIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>
}

// Create context.
const ToastContext = createContext<ToastContextValue | null>(null)

// Custom hook to access context.
export function useToast(): ToastContextValue {
   const context = useContext(ToastContext)
   if (!context) {
      throw new Error('useDangerToast must be used within a ToastProvider')
   }
   return context
}

// Provider component.
export function ToastProvider({ children }: { children: ReactNode }) {
   const [dangerToastIsDisplayed, setDangerToastIsDisplayed] =
      useState<boolean>(false)
   const [successToastIsDisplayed, setSuccessToastIsDisplayed] =
      useState<boolean>(false)

   const value: ToastContextValue = {
      dangerToastIsDisplayed,
      setDangerToastIsDisplayed,
      successToastIsDisplayed,
      setSuccessToastIsDisplayed,
   }

   return (
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
   )
}
