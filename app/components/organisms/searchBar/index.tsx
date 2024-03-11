import React, { useState } from 'react'

export function SearchBar({
   onSearch,
}: {
   onSearch: (filteredData: string) => void
}) {
   const [searchTerm, setSearchTerm] = useState('')

   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value)
   }

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      // Trigger search callback with filtered data.
      onSearch(searchTerm)
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="absolute top-16 transform left-16 z-40 min-w-[32rem] mx-auto"
      >
         <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium sr-only text-white"
         >
            Search
         </label>
         <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none z-50">
               <svg
                  className="w-4 h-4 text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
               >
                  <path
                     stroke="currentColor"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
               </svg>
            </div>
            <input
               type="search"
               id="default-search"
               className="block w-full p-4 ps-10 text-sm text-white rounded-lg placeholder-gray-400 bg-white/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5"
               placeholder="Callsign of the vehicle (8 chars)."
               value={searchTerm}
               onChange={handleChange}
               required
            />
            <button
               type="submit"
               className="text-white absolute end-2.5 bottom-2.5 bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2"
            >
               Search
            </button>
         </div>
      </form>
   )
}
