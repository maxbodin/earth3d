import { useOuterSpaceTab } from '@/app/components/organisms/dashboardTabs/outerSpaceTab/model'

export function OuterSpaceTabController() {
   const {
      setConstellationBoundsActivated,
      setConstellationFiguresActivated,
      setHypticActivated,
   } = useOuterSpaceTab()

   function activateConstellationBounds(): void {
      setConstellationBoundsActivated(true)
   }

   function deactivateConstellationBounds(): void {
      setConstellationBoundsActivated(false)
   }

   function activateConstellationFigures(): void {
      setConstellationFiguresActivated(true)
   }

   function deactivateConstellationFigures(): void {
      setConstellationFiguresActivated(false)
   }

   function activateHyptic(): void {
      setHypticActivated(true)
   }

   function deactivateHyptic(): void {
      setHypticActivated(false)
   }

   return {
      activateConstellationBounds,
      deactivateConstellationBounds,
      activateConstellationFigures,
      deactivateConstellationFigures,
      activateHyptic,
      deactivateHyptic,
   }
}
