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
   MousePointer2Icon,
   ShuffleIcon,
} from 'lucide-react'
import { CursorModeType } from '@/app/enums/modeType'
import { SceneType } from '@/app/enums/sceneType'

interface NavigationBarActionGroupProps {
   displayedSceneType: SceneType | null
   cursorMode: CursorModeType
   trueSize: boolean
   isRandomPlaceLoading: boolean
   onToggleSolarSystemScale: () => void
   onBackToEarth: () => void
   onToggleCursorMode: () => void
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
                                             isRandomPlaceLoading,
                                             onToggleSolarSystemScale,
                                             onBackToEarth,
                                             onToggleCursorMode,
                                             onOpenMarkers,
                                             onOpenSettings,
                                             onOpenData,
                                             onOpenCredit,
                                             onRandomPlace,
                                          }: NavigationBarActionGroupProps): React.JSX.Element {
   const isSolarSystemScene = displayedSceneType === SceneType.SOLAR_SYSTEM

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
                     onClick={onToggleSolarSystemScale}
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
                     onClick={onBackToEarth}
                  >
                     <EarthIcon />
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
                     onClick={onToggleCursorMode}
                  >
                     {cursorMode === CursorModeType.POINTER ? <MousePointer2Icon /> : <HandIcon />}
                  </Button>
               </Tooltip>

               <Tooltip content="Open Markers">
                  <Button
                     size="lg"
                     isIconOnly
                     variant="bordered"
                     aria-label="Open Markers"
                     onClick={onOpenMarkers}
                  >
                     <PinIcon />
                  </Button>
               </Tooltip>
            </>
         )}

         <Tooltip content="Open Settings">
            <Button
               size="lg"
               isIconOnly
               variant="bordered"
               aria-label="Open Settings"
               onClick={onOpenSettings}
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
               onClick={onOpenData}
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
               onClick={onOpenCredit}
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
                  onClick={onRandomPlace}
                  isLoading={isRandomPlaceLoading}
               >
                  <ShuffleIcon />
               </Button>
            </Tooltip>
         )}
      </ButtonGroup>
   )
}
