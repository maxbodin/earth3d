import React, { createContext, ReactNode, useContext } from 'react'
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState'
import { STORAGE_KEY_COUNTRIES_FRONTIERS, STORAGE_KEY_COUNTRIES_NAMES } from '@/app/constants/storageKeys'

interface CountriesTabContextValue {
   frontiersActivated: boolean
   setFrontiersActivated: React.Dispatch<React.SetStateAction<boolean>>

   namesActivated: boolean
   setNamesActivated: React.Dispatch<React.SetStateAction<boolean>>
}

const CountriesTabContext = createContext<CountriesTabContextValue | null>(null)

export function useCountriesTab(): CountriesTabContextValue {
   const context = useContext(CountriesTabContext)
   if (!context) {
      throw new Error(
         'useCountriesTab must be used within a CountriesTabProvider',
      )
   }
   return context
}

export function CountriesTabProvider({ children }: { children: ReactNode }) {
   const [frontiersActivated, setFrontiersActivated] = useLocalStorageState<boolean>(STORAGE_KEY_COUNTRIES_FRONTIERS, false)
   const [namesActivated, setNamesActivated] = useLocalStorageState<boolean>(STORAGE_KEY_COUNTRIES_NAMES, false)

   const value: CountriesTabContextValue = {
      frontiersActivated,
      setFrontiersActivated,
      namesActivated,
      setNamesActivated,
   }

   return (
      <CountriesTabContext.Provider value={value}>
         {children}
      </CountriesTabContext.Provider>
   )
}
