import React, { createContext, ReactNode, useContext, useState } from 'react'

interface CountriesContextValue {
   selectedCountry: string
   setSelectedCountry: React.Dispatch<React.SetStateAction<string>>
}

const CountriesContext = createContext<CountriesContextValue | null>(null)

export function useCountries(): CountriesContextValue {
   const context = useContext(CountriesContext)
   if (!context) {
      throw new Error('useCountries must be used within a CountriesProvider')
   }
   return context
}

// Provider component.
export function CountriesProvider({ children }: { children: ReactNode }) {
   const [selectedCountry, setSelectedCountry] = useState<string>('')

   const value: CountriesContextValue = {
      selectedCountry,
      setSelectedCountry,
   }

   return (
      <CountriesContext.Provider value={value}>
         {children}
      </CountriesContext.Provider>
   )
}
