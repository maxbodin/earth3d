import { useCallback } from 'react'
import {
   useEarthquakesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/earthquakesTab/earthquakesTab.model'

interface EarthquakesTabControllerResult {
   activateEarthquakes: () => void
   deactivateEarthquakes: () => void
}

export function EarthquakesTabController(): EarthquakesTabControllerResult {
   const { setEarthquakesActivated } = useEarthquakesTab()

   const activateEarthquakes = useCallback((): void => {
      setEarthquakesActivated(true)
   }, [setEarthquakesActivated])

   const deactivateEarthquakes = useCallback((): void => {
      setEarthquakesActivated(false)
   }, [setEarthquakesActivated])

   return {
      activateEarthquakes,
      deactivateEarthquakes,
   }
}
