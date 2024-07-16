import React, { createContext, ReactNode, useContext, useState } from 'react'
import { SearchSubjectType } from '@/app/enums/SearchSubjectType'

interface SearchBarContextValue {
   selectedSubject: SearchSubjectType
   setSelectedSubject: React.Dispatch<React.SetStateAction<SearchSubjectType>>
}

// Create SearchBarContext.
const SearchBarContext = createContext<SearchBarContextValue | null>(null)

// Custom hook to access SearchBarContext.
export function useSearchBar(): SearchBarContextValue {
   const context = useContext(SearchBarContext)
   if (!context) {
      throw new Error('useSearchBar must be used within a SearchBarProvider')
   }
   return context
}

// Provider component.
export function SearchBarProvider({ children }: { children: ReactNode }) {
   const [selectedSubject, setSelectedSubject] = useState<SearchSubjectType>(
      SearchSubjectType.COUNTRY,
   )

   const value: SearchBarContextValue = {
      selectedSubject: selectedSubject,
      setSelectedSubject: setSelectedSubject,
   }

   return (
      <SearchBarContext.Provider value={value}>
         {children}
      </SearchBarContext.Provider>
   )
}
