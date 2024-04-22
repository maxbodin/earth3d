'use client'
import React from 'react'
import { ToastDanger } from '@/app/components/molecules/toasts/toastDanger/toastDanger'
import { ToastSuccess } from '@/app/components/molecules/toasts/toastSuccess/toastSuccess'
import { useToast } from '@/app/context/toastsContext'
import { useData } from '@/app/context/dataContext'
import { VesselDataFetch } from '@/app/components/atoms/dataFetch/vesselDataFetch/vesselDataFetch'
import { MapProvider } from '@/app/context/mapContext'
import { CreditView } from '@/app/components/organisms/credit/credit.view'
import { DashboardView } from '@/app/components/organisms/dashboard/dashboard.view'
import { NavigationBar } from '@/app/components/molecules/navigationBar/navigationBar'
import { SearchBar } from '@/app/components/organisms/searchBar/searchBar'
import { DetailsCard } from '@/app/components/organisms/detailsCard/detailsCard'
import { ThreeScene } from '@/app/components/templates/threeScene/threeScene'
import { ScenesProvider } from '@/app/components/templates/scenes/scenes.model'

export default function Home() {
   const {
      dangerToastIsDisplayed,
      setDangerToastIsDisplayed,
      successToastIsDisplayed,
      setSuccessToastIsDisplayed,
   } = useToast()

   const { setSelectedObjectData } = useData()

   const dataToFilter: any = null

   /**
    * Callback function to handle search.
    * @param searchTerm
    */
   const handleSearch = (searchTerm: string): void => {
      // Filter data based on search term (assuming data is an array)
      const filtered = dataToFilter.filter((state: any) =>
         state[1].includes(searchTerm)
      )

      setSelectedObjectData(filtered.length > 0 ? { data: filtered[0] } : {})

      if (filtered.length > 0) {
         setSuccessToastIsDisplayed(true)
         setDangerToastIsDisplayed(false)
      } else {
         setSuccessToastIsDisplayed(false)
         setDangerToastIsDisplayed(true)
      }
   }

   return (
      <>
         <MapProvider>
            <DashboardView />
            <CreditView />

            <div className="w-full items-center justify-between font-mono text-sm lg:flex">
               <SearchBar onSearch={handleSearch} />
               <DetailsCard />
               <NavigationBar />
            </div>

            <ScenesProvider>
               <ThreeScene />
            </ScenesProvider>
         </MapProvider>

         {/*         <PlaneDataFetch />
          */}
         <VesselDataFetch />
         {successToastIsDisplayed && <ToastSuccess message={'Plane found.'} />}
         {dangerToastIsDisplayed && (
            <ToastDanger message={'Plane not found.'} />
         )}
      </>
   )
}
