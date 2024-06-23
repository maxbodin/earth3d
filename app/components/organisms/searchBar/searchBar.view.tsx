import React, { useEffect } from 'react'
import { FadeInOut } from '@/app/components/atoms/ui/fadeInOut/fadeInOut'
import {
   AutocompleteItem,
   Avatar,
   Button,
   Dropdown,
   DropdownItem,
   DropdownMenu,
   DropdownTrigger,
} from '@nextui-org/react'
import { SearchSubjectType } from '@/app/enums/SearchSubjectType'
import { Autocomplete } from '@nextui-org/autocomplete'
import { Feature } from '@/app/types/orsTypes'
import { Country } from '@/app/types/countryType'
import { SearchBarController } from '@/app/components/organisms/searchBar/searchBar.controller'
import { useUi } from '@/app/context_todo_improve/UIContext'

export function SearchBarView() {
   const {
      autoCompleteError,
      autoCompleteLoading,
      isInvalid,
      errorMessage,
      handleInputChange,
      selectedSubject,
      inputLabel,
      searchTerm,
      featureSuggestions,
      countrySuggestions,
      onSubjectSelected,
      onInputChange,
      onSelectionChange,
   } = SearchBarController()

   const { isSearchBarDisplayed } = useUi()

   /**
    * Use effect to clean up debounce on unmount.
    */
   useEffect(() => {
      return (): void => {
         handleInputChange.cancel()
      }
   }, [handleInputChange])


   return (
      <>
         <FadeInOut isVisible={isSearchBarDisplayed}>
            <div className="absolute top-16 transform left-16 z-40 min-w-[32rem] mx-auto">
               <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <Dropdown>
                     <DropdownTrigger>
                        <Button variant="bordered" className="h-[48px] rounded-r-none">
                           {selectedSubject.toString()}
                        </Button>
                     </DropdownTrigger>
                     <DropdownMenu
                        aria-label="Search Subject Selection"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedSubject}
                        onSelectionChange={onSubjectSelected}
                     >
                        {Object.values(SearchSubjectType).map(
                           (subject: string) => (
                              <DropdownItem key={subject}>
                                 {subject}
                              </DropdownItem>
                           ),
                        )}
                     </DropdownMenu>
                  </Dropdown>

                  <Autocomplete
                     className="max-w-xl"
                     isLoading={autoCompleteLoading}
                     inputProps={{
                        classNames: {
                           input: 'ml-1 rounded-l-none',
                           inputWrapper: 'h-[48px] rounded-l-none',
                        },
                     }}
                     isClearable
                     onSelectionChange={onSelectionChange}
                     onInputChange={onInputChange}
                     label={inputLabel}
                     variant="bordered"
                     isInvalid={isInvalid}
                     errorMessage={errorMessage}
                     isRequired
                     type="search"
                     value={searchTerm}
                  >
                     {selectedSubject === SearchSubjectType.PLACE
                        ? featureSuggestions.map((feature: Feature) => (
                           <AutocompleteItem key={feature.properties.id}>
                              {feature.properties.label}
                           </AutocompleteItem>
                        ))
                        : selectedSubject === SearchSubjectType.COUNTRY
                           ? countrySuggestions.map((country: Country) => (
                              <AutocompleteItem
                                 key={country.country}
                                 startContent={
                                    <Avatar
                                       alt={country.country}
                                       className="w-6 h-6"
                                       src={`https://flagcdn.com/${country.alpha2.toLowerCase()}.svg`}
                                    />
                                 }
                              >
                                 {country.country}
                              </AutocompleteItem>
                           ))
                           : []}
                  </Autocomplete>
               </div>
               {autoCompleteError && (
                  <p className="text-red-500">{autoCompleteError}</p>
               )}
               {autoCompleteLoading && (
                  <p className="text-gray-500">Loading...</p>
               )}
            </div>
         </FadeInOut>
      </>
   )
}
