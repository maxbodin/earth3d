import React from 'react'
import { SettingsDashboardView } from '@/app/components/organisms/settingsDashboard/settingsDashboard.view'
import { PlaneMapProvider } from '@/app/components/atoms/three/planeMapContext'
import { CreditView } from '@/app/components/organisms/credit/credit.view'
import { DataDashboardView } from '@/app/components/organisms/dataDashboard/dataDashboard.view'
import { ScenesProvider } from '@/app/components/templates/scenes/scenes.model'
import { SolarSystemProvider } from '@/app/components/atoms/three/solarSystem/solarSystem.model'
import { ThreeScene } from '@/app/components/templates/threeScene/threeScene'
import { AstresListProvider } from '@/app/components/organisms/astresList/astresList.model'
import { AstresListView } from '@/app/components/organisms/astresList/astresList.view'
import { NavigationBar } from '@/app/components/molecules/navigationBar/navigationBar'
import { MarkersDashboardView } from '@/app/components/organisms/markersDashboard/markersDashboard.view'
import { SearchBarView } from '@/app/components/organisms/searchBar/searchBar.view'
import { DetailsCard } from '@/app/components/organisms/detailsCard/detailsCard'
import { Geolocation } from '@/app/components/atoms/geolocation/geolocation'
import { CoordinatesSearchParamsSync } from '@/app/components/atoms/geolocation/coordinatesSearchParamsSync'
import { MarkersController } from '@/app/components/atoms/three/markers/markers.controller'
import { DistanceMeasurementController } from '@/app/components/atoms/three/distanceMeasurement.controller'
import { CountriesProvider } from '@/app/components/atoms/three/countries/countries.model'

export default function Home() {
   return (
      <PlaneMapProvider>
         <SolarSystemProvider>
            <CreditView />
            <DataDashboardView />
            <ScenesProvider>
               <CountriesProvider>
                  <AstresListProvider>
                     <AstresListView />
                     <ThreeScene />
                     <div className="w-full items-center justify-between font-mono text-sm lg:flex">
                        <SearchBarView />
                        <DetailsCard />
                        <NavigationBar />
                     </div>
                  </AstresListProvider>
                  <MarkersDashboardView />
                  <SettingsDashboardView />
                  <Geolocation />
                  <MarkersController />
                  <DistanceMeasurementController />
                  <CoordinatesSearchParamsSync />
               </CountriesProvider>
            </ScenesProvider>
         </SolarSystemProvider>
      </PlaneMapProvider>
   )
}
