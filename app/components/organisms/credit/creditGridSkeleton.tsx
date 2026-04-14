import React from 'react'
import { Skeleton } from '@/shadcn/ui/skeleton'

const SKELETON_CARD_COUNT = 6

export function CreditGridSkeleton(): React.JSX.Element {
   return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
         {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index: number) => (
            <div
               key={`credit-skeleton-${index}`}
               className="rounded-lg border border-white/15 bg-white/[0.04] p-4"
            >
               <Skeleton className="mb-3 h-4 w-2/3 bg-white/15" />
               <Skeleton className="mb-2 h-3 w-full bg-white/10" />
               <Skeleton className="mb-4 h-3 w-5/6 bg-white/10" />
               <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-14 rounded-full bg-white/10" />
                  <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
               </div>
               <Skeleton className="mt-4 h-3 w-1/2 bg-white/10" />
               <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
            </div>
         ))}
      </div>
   )
}
