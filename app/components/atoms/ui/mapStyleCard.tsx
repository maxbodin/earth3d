'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@nextui-org/react'
import { Check } from 'lucide-react'
import { MapStyleOption } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.styles'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/shadcn/ui/skeleton'

// A fixed tile that covers Western Europe / North Africa at zoom 2
// recognizable enough to see style differences without exposing the token.
const PREVIEW_ZOOM = 2
const PREVIEW_X = 2
const PREVIEW_Y = 1

function buildPreviewUrl(styleId: string): string {
   return `/api/mapbox/v4/${encodeURIComponent(styleId)}/${PREVIEW_ZOOM}/${PREVIEW_X}/${PREVIEW_Y}`
}

interface MapStyleCardProps {
   option: MapStyleOption
   isSelected: boolean
   onSelect: () => void
}

/**
 * Selectable card for one map style.
 *
 * Shows a real tile preview fetched through the server-side Mapbox proxy so
 * the token is never exposed to the browser.
 */
export function MapStyleCard({ option, isSelected, onSelect }: MapStyleCardProps) {
   const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading')

   const previewUrl = buildPreviewUrl(option.id)

   return (
      <Button
         type="button"
         onPress={onSelect}
         aria-pressed={isSelected}
         title={option.title}
         variant="light"
         size="lg"
         fullWidth
         className={cn(
            'relative h-auto min-h-0 min-w-0 w-full flex flex-col items-stretch gap-2 rounded-lg border p-2',
            isSelected
               ? 'border-white-400 bg-white/10 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
               : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8',
         )}
      >
         <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden bg-white/10">
            {imgState === 'loading' && (
               <Skeleton className="absolute inset-0 rounded-md bg-white/10" />
            )}

            {imgState === 'error' && (
               <div className="absolute inset-0 flex items-center justify-center bg-red/5 rounded-md">
                  <span className="text-red/30 text-xs">?</span>
               </div>
            )}

            <Image
               src={previewUrl}
               alt={option.title}
               fill
               unoptimized
               sizes="(max-width: 768px) 18vw, (max-width: 1200px) 14vw, 96px"
               draggable={false}
               onLoad={() => setImgState('loaded')}
               onError={() => setImgState('error')}
               className={cn(
                  'object-cover rounded-md transition-opacity duration-300',
                  imgState === 'loaded' ? 'opacity-100' : 'opacity-0',
               )}
            />
         </div>

         <span className="text-md font-medium text-white/70 text-center leading-tight line-clamp-2 w-full px-2">
            {option.title}
         </span>

         {isSelected && (
            <span
               aria-hidden="true"
               className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white-400 flex items-center justify-center shadow"
            >
               <Check className="w-5 h-5 text-white" strokeWidth={2.8} />
            </span>
         )}
      </Button>
   )
}
