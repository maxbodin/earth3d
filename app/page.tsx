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

export default function Home() {

   /**

    const { setSelectedObjectData } = useData();

    const dataToFilter: any = null;

    * Callback function to handle search.
    * @param searchTerm

    // TODO WIP DEL ?
    const handleSearch = (searchTerm: string): void => {
    // Filter data based on search term (assuming data is an array)
    const filtered = dataToFilter.filter((state: any) =>
    state[1].includes(searchTerm)
    );

    setSelectedObjectData(filtered.length > 0 ? { data: filtered[0] } : {});

    if (filtered.length > 0) {
    setSuccessToastIsDisplayed(true);
    setDangerToastIsDisplayed(false);
    } else {
    setSuccessToastIsDisplayed(false);
    setDangerToastIsDisplayed(true);
    }
    };
    */

   return (
      <PlaneMapProvider>
         <SettingsDashboardView />
         <CreditView />
         <DataDashboardView />
         <SolarSystemProvider>
            <ScenesProvider>
               <AstresListProvider>
                  <AstresListView />
                  <ThreeScene />
               </AstresListProvider>
               <MarkersDashboardView />
               <Geolocation />
               <div className="w-full items-center justify-between font-mono text-sm lg:flex">
                  <SearchBarView />
                  <DetailsCard />
                  <NavigationBar />
               </div>
            </ScenesProvider>
         </SolarSystemProvider>
      </PlaneMapProvider>
   )
}
