import React from 'react'
import { Button, ButtonGroup, Tooltip } from '@nextui-org/react'
import { PinIcon } from '@/app/components/icons/pinIcon'
import { DashboardIcon } from '@/app/components/icons/dashboardIcon'
import { DataIcon } from '@/app/components/icons/dataIcon'
import { CreditIcon } from '@/app/components/icons/creditIcon'
import {
   AArrowDownIcon,
   AArrowUpIcon,
   EarthIcon,
   HandIcon,
   LocateFixedIcon,
   MousePointer2Icon,
   OrbitIcon,
   RulerIcon,
   ShuffleIcon,
} from 'lucide-react'
import { CursorModeType } from '@/app/enums/modeType'
import { SceneType } from '@/app/enums/sceneType'

interface NavigationBarActionGroupProps {
   displayedSceneType: SceneType | null
   cursorMode: CursorModeType
   trueSize: boolean
   showTrajectories: boolean
   canFocusUserPosition: boolean
   isRandomPlaceLoading: boolean
   onToggleSolarSystemScale: () => void
   onToggleSolarSystemTrajectories: () => void
   onBackToEarth: () => void
   onFocusUserPosition: () => void
   onToggleCursorMode: () => void
   onToggleDistanceMode: () => void
   onOpenMarkers: () => void
   onOpenSettings: () => void
   onOpenData: () => void
   onOpenCredit: () => void
   onRandomPlace: () => void
}

export function NavigationBarActionGroup({
                                             displayedSceneType,
                                             cursorMode,
                                             trueSize,
                                             showTrajectories,
                                             canFocusUserPosition,
                                             isRandomPlaceLoading,
                                             onToggleSolarSystemScale,
                                             onToggleSolarSystemTrajectories,
                                             onBackToEarth,
                                             onFocusUserPosition,
                                             onToggleCursorMode,
                                             onToggleDistanceMode,
                                             onOpenMarkers,
                                             onOpenSettings,
                                             onOpenData,
                                             onOpenCredit,
                                             onRandomPlace,
                                          }: NavigationBarActionGroupProps): React.JSX.Element {
   const isSolarSystemScene = displayedSceneType === SceneType.SOLAR_SYSTEM
   const isPlanisphereOrSphereScene = displayedSceneType === SceneType.PLANE
      || displayedSceneType === SceneType.SPHERICAL

   return (
      <ButtonGroup
         variant="bordered"
         className="rounded-2xl bg-white/10 bg-opacity-10 backdrop-blur-md drop-shadow-lg"
      >
         {isSolarSystemScene && (
            <>
               <Tooltip content={trueSize ? 'Switch to Visualization Size' : 'Switch to True Size'}>
                  <Button
                     size="lg"
                     isIconOnly
                     variant="bordered"
                     aria-label={trueSize ? 'Switch to Visualization Size' : 'Switch to True Size'}
                     onPress={onToggleSolarSystemScale}
                     className={trueSize ? 'bg-white/20' : ''}
                  >
                     {trueSize ? <AArrowUpIcon /> : <AArrowDownIcon />}
                  </Button>
               </Tooltip>
               <Tooltip content="Get back to Earth.">
                  <Button
                     size="lg"
                     isIconOnly
                     variant="bordered"
                     aria-label="Get back to Earth."
                     onPress={onBackToEarth}
                  >
                     <EarthIcon />
                  </Button>
               </Tooltip>
               <Tooltip content={showTrajectories ? 'Hide Planet Trajectories' : 'Show Planet Trajectories'}>
                  <Button
                     size="lg"
                     isIconOnly
                     variant="bordered"
                     aria-label={showTrajectories ? 'Hide Planet Trajectories' : 'Show Planet Trajectories'}
                     onPress={onToggleSolarSystemTrajectories}
                     className={showTrajectories ? 'bg-white/20' : ''}
                  >
                     <OrbitIcon />
                  </Button>
               </Tooltip>
            </>
         )}

         {!isSolarSystemScene && (
            <>
               <Tooltip
                  content={
                     cursorMode === CursorModeType.POINTER
                        ? 'Switch to Hand Mode'
                        : 'Switch to Select Mode'
                  }
               >
                  <Button
                     size="lg"
                     isIconOnly
                     variant="bordered"
                     aria-label={
                        cursorMode === CursorModeType.POINTER
                           ? 'Switch to Hand Mode'
                           : 'Switch to Select Mode'
                     }
                     onPress={onToggleCursorMode}
                  >
                     {cursorMode === CursorModeType.POINTER ? <MousePointer2Icon /> : <HandIcon />}
                  </Button>
               </Tooltip>

               <Tooltip content={cursorMode === CursorModeType.DISTANCE ? 'Cancel Distance Measurement' : 'Measure Distance (2 clicks)'}>
                  <Button
                     size="lg"
                     isIconOnly
                     variant="bordered"
                     aria-label="Measure Distance"
                     onPress={onToggleDistanceMode}
                     className={cursorMode === CursorModeType.DISTANCE ? 'bg-white/20' : ''}
                  >
                     <RulerIcon />
                  </Button>
               </Tooltip>

               <Tooltip content="Open Markers">
                  <Button
                     size="lg"
                     isIconOnly
                     variant="bordered"
                     aria-label="Open Markers"
                     onPress={onOpenMarkers}
                  >
                     <PinIcon />
                  </Button>
               </Tooltip>

               {isPlanisphereOrSphereScene && canFocusUserPosition && (
                  <Tooltip content="Focus on Your Position">
                     <Button
                        size="lg"
                        isIconOnly
                        variant="bordered"
                        aria-label="Focus on Your Position"
                        onPress={onFocusUserPosition}
                     >
                        <LocateFixedIcon />
                     </Button>
                  </Tooltip>
               )}
            </>
         )}

         <Tooltip content="Open Settings">
            <Button
               size="lg"
               isIconOnly
               variant="bordered"
               aria-label="Open Settings"
               onPress={onOpenSettings}
            >
               <DashboardIcon />
            </Button>
         </Tooltip>

         <Tooltip content="Open Data">
            <Button
               size="lg"
               isIconOnly
               variant="bordered"
               aria-label="Open Data"
               onPress={onOpenData}
            >
               <DataIcon />
            </Button>
         </Tooltip>

         <Tooltip content="Open Credit">
            <Button
               size="lg"
               isIconOnly
               variant="bordered"
               aria-label="Open Credit"
               onPress={onOpenCredit}
            >
               <CreditIcon />
            </Button>
         </Tooltip>

         {!isSolarSystemScene && (
            <Tooltip content="Random Place">
               <Button
                  size="lg"
                  isIconOnly
                  variant="bordered"
                  aria-label="Random Place"
                  onPress={onRandomPlace}
                  isLoading={isRandomPlaceLoading}
               >
                  <ShuffleIcon />
               </Button>
            </Tooltip>
         )}
      </ButtonGroup>
   )
}
