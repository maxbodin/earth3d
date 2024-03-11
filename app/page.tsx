'use client'
import React, { useEffect, useState } from 'react'
import { DetailsCard } from '@/app/components/organisms/detailsCard'
import { SearchBar } from '@/app/components/organisms/searchBar'
import { ThreeScene } from '@/app/components/templates/threeScene'
import { ToastDanger } from '@/app/components/molecules/toastDanger'
import { ToastSuccess } from '@/app/components/molecules/toastSuccess'
import { useToast } from '@/app/context/toastsContext'
import { NavigationBar } from '@/app/components/molecules/navigationBar'
import { useData } from '@/app/context/dataContext'
import {
   fetchPlanesData,
   fetchPlaneTrackData,
} from '@/app/services/planeDataService'

//import { startConnection } from '@/app/services/boatDataService'

export default function Home() {
   const [data, setData] = useState<any[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState(null)

   const { setPlaneTrackData, setSelectedObjectData, selectedObjectData } =
      useData()

   useEffect(() => {
      fetchPlanesData()
         .then((jsonData) => {
            setData(jsonData.states || [])
            setIsLoading(false)
         })
         .catch((error) => {
            setError(error.message)
            setIsLoading(false)
         })
   }, [])

   const {
      dangerToastIsDisplayed,
      setDangerToastIsDisplayed,
      successToastIsDisplayed,
      setSuccessToastIsDisplayed,
   } = useToast()

   // Callback function to handle search.
   const handleSearch = (searchTerm: string) => {
      // Filter data based on search term (assuming data is an array)
      const filtered = data.filter((state: any) =>
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

   const handleOpenDashboard = () => {
      console.log('OPENING DASHBOARD')
   }

   const onPlaneSelected = (data: Record<string, any>): void => {
      setSelectedObjectData(data)

      fetchPlaneTrackData(data.data[0])
         .then((jsonData) => {
            const pathData = jsonData.path
            setPlaneTrackData(jsonData.path)
         })
         .catch((error) => {
            setError(error.message)
         })
   }

   //startConnection()

   return (
      <main className="flex min-h-screen h-full flex-col items-center justify-between p-24">
         <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
            <SearchBar onSearch={handleSearch} />
            <ThreeScene data={data} onPlaneClick={onPlaneSelected} />
            <DetailsCard />
         </div>
         {isLoading && <p>Loading...</p>}
         {error && <p>Error: {error}</p>}
         {successToastIsDisplayed && <ToastSuccess message={'Plane found.'} />}
         {dangerToastIsDisplayed && (
            <ToastDanger message={'Plane not found.'} />
         )}
         <NavigationBar onClick={handleOpenDashboard} />
      </main>
   )
}
