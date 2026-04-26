'use client'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useUi } from '@/app/context/uiContext'
import './styles.css'
import { PanelType } from '@/app/enums/panelType'
import { useCredit } from '@/app/components/organisms/credit/credit.model'
import { Button, Tooltip } from '@nextui-org/react'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { useDataDashboard } from '@/app/components/organisms/dataDashboard/dataDashboard.model'
import { useSettingsDashboard } from '@/app/components/organisms/settingsDashboard/settingsDashboard.model'
import { GithubIcon, } from 'lucide-react'
import Link from 'next/link'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { CursorModeType } from '@/app/enums/modeType'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useSolarSystem } from '@/app/components/atoms/three/solarSystem/solarSystem.model'
import { NavigationBarActionGroup, } from '@/app/components/molecules/navigationBar/navigationBarActionGroup'
import { useRandomLandPlace, } from '@/app/components/molecules/navigationBar/useRandomLandPlace'

export function NavigationBar() {
   const {
      setIsNavBarDisplayed,
      isNavBarDisplayed,
      setIsSearchBarDisplayed,
      setOpenedPanelType,
      openedPanelType,
   } = useUi()

   const { setIsSettingsDashboardOpen } = useSettingsDashboard()
   const { setIsCreditOpen } = useCredit()
   const { setIsMarkersDashboardOpen, markers } = useMarkersDashboard()
   const { setIsDataDashboardOpen } = useDataDashboard()

   const { displayedSceneData } = useScenes()
   const { flyToCoordinates } = CameraFlyController()
   const { setSelectedObjectType, setSelectedObjectData, cursorMode, setCursorMode } = useSelection()

   const { trueSize, setTrueSize, showTrajectories, setShowTrajectories } = useSolarSystem()

   const { getRandomPlace, isRandomPlaceLoading } = useRandomLandPlace({
      flyToCoordinates,
      setSelectedObjectData,
      setSelectedObjectType,
   })

   const userPuckMarker = useMemo(() => {
      return markers.find(marker => {
         return marker.isPuck && Number.isFinite(marker.latitude) && Number.isFinite(marker.longitude)
      })
   }, [markers])

   const openPanel = useCallback((panelType: PanelType): void => {
      setIsNavBarDisplayed(false)
      setIsSearchBarDisplayed(false)
      setOpenedPanelType(panelType)

      switch (panelType) {
         case PanelType.MARKERS:
            setIsMarkersDashboardOpen(true)
            break
         case PanelType.DASHBOARD:
            setIsSettingsDashboardOpen(true)
            break
         case PanelType.CREDIT:
            setIsCreditOpen(true)
            break
         case PanelType.DATA:
            setIsDataDashboardOpen(true)
            break
      }
   }, [
      setIsNavBarDisplayed,
      setIsSearchBarDisplayed,
      setOpenedPanelType,
      setIsMarkersDashboardOpen,
      setIsSettingsDashboardOpen,
      setIsCreditOpen,
      setIsDataDashboardOpen,
   ])

   const openMarkers = useCallback((): void => {
      openPanel(PanelType.MARKERS)
   }, [openPanel])

   const openDashboard = useCallback((): void => {
      openPanel(PanelType.DASHBOARD)
   }, [openPanel])

   const openCredit = useCallback((): void => {
      openPanel(PanelType.CREDIT)
   }, [openPanel])

   const openData = useCallback((): void => {
      openPanel(PanelType.DATA)
   }, [openPanel])

   useEffect((): void => {
      document.body.style.cursor = cursorMode === CursorModeType.HAND
         ? 'pointer'
         : 'default'
   }, [cursorMode])

   const reverseCursorMode = useCallback((): void => {
      setCursorMode(cursorMode == CursorModeType.HAND ? CursorModeType.POINTER : CursorModeType.HAND)
   }, [cursorMode, setCursorMode])

   const reverseSolarSystemTrueSize = useCallback((): void => {
      setTrueSize((prevState: boolean) => {
         return !prevState
      })
   }, [setTrueSize])

   const reverseSolarSystemTrajectories = useCallback((): void => {
      setShowTrajectories((prevState: boolean) => {
         return !prevState
      })
   }, [setShowTrajectories])

   const focusOnUserPosition = useCallback((): void => {
      if (userPuckMarker == null) return

      flyToCoordinates(userPuckMarker.latitude, userPuckMarker.longitude)
   }, [flyToCoordinates, userPuckMarker])

   const handleBackToEarth = useCallback((): void => {
      // TODO : Implement get back to earth scene instantly.
   }, [])

   return (
            <div
               className={`flex flex-row navbaricons absolute right-10 p-4 transform bottom-10 z-40 transition-opacity duration-150 ${
                  isNavBarDisplayed ? 'opacity-100' : 'opacity-0 pointer-events-none'
               }`}>
               <NavigationBarActionGroup
                  displayedSceneType={displayedSceneData?.type ?? null}
                  cursorMode={cursorMode}
                  trueSize={trueSize}
                  showTrajectories={showTrajectories}
                  canFocusUserPosition={userPuckMarker != null}
                  isRandomPlaceLoading={isRandomPlaceLoading}
                  onToggleSolarSystemScale={reverseSolarSystemTrueSize}
                  onToggleSolarSystemTrajectories={reverseSolarSystemTrajectories}
                  onBackToEarth={handleBackToEarth}
                  onFocusUserPosition={focusOnUserPosition}
                  onToggleCursorMode={reverseCursorMode}
                  onOpenMarkers={openMarkers}
                  onOpenSettings={openDashboard}
                  onOpenData={openData}
                  onOpenCredit={openCredit}
                  onRandomPlace={getRandomPlace}
               />
               <div className="pl-4">
                  <Tooltip content="GitHub Project">
                     <Button size="lg" isIconOnly variant="bordered" aria-label="Open GitHub Project"
                             as={Link}
                             className="bg-black"
                             href={'https://github.com/maxbodin/earth3d'}>
                        <GithubIcon />
                     </Button>
                  </Tooltip>
               </div>
            </div>
   )
}
