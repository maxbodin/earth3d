import React, { createContext, ReactNode, useContext, useState } from 'react'

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
   const [frontiersActivated, setFrontiersActivated] = useState<boolean>(false)
   const [namesActivated, setNamesActivated] = useState<boolean>(false)

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
