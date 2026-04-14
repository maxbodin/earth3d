import React, { useEffect, useState } from 'react'
import { Button } from '@nextui-org/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/shadcn/ui/skeleton'


export interface PlaceImageCarouselProps {
   imageUrls: string[]
   imagesLoading: boolean
}

export function PlaceImageCarousel({
                                       imageUrls,
                                       imagesLoading,
                                    }: PlaceImageCarouselProps): React.JSX.Element {
   const [activeIndex, setActiveIndex] = useState<number>(0)

   useEffect((): void => {
      setActiveIndex(0)
   }, [imageUrls])

   const hasImages = imageUrls.length > 0
   const hasCarouselNavigation = imageUrls.length > 1

   const goToNext = (): void => {
      if (!hasCarouselNavigation) return

      setActiveIndex((previousIndex: number) => {
         return (previousIndex + 1) % imageUrls.length
      })
   }

   const goToPrevious = (): void => {
      if (!hasCarouselNavigation) return

      setActiveIndex((previousIndex: number) => {
         return (previousIndex - 1 + imageUrls.length) % imageUrls.length
      })
   }

   return (
      <section className="w-full max-w-full overflow-hidden">
         <h3 className="mb-2 text-sm font-semibold text-white/80">Images</h3>
         <div className="w-full max-w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <div className="relative aspect-[4/3] w-full">
               {imagesLoading && (
                  <Skeleton className="absolute inset-0 rounded-none bg-white/10" />
               )}

               {!imagesLoading && hasImages && (
                  <>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img
                        src={imageUrls[activeIndex]}
                        alt={`Place photo ${activeIndex + 1}`}
                        className="h-full w-full object-cover"
                     />

                     {hasCarouselNavigation && (
                        <div className="absolute inset-x-0 bottom-2 flex items-center justify-between px-2">
                           <Button
                              isIconOnly
                              size="sm"
                              variant="solid"
                              aria-label="Previous image"
                              onClick={goToPrevious}
                              className="min-w-0 bg-black/55"
                           >
                              <ChevronLeft className="h-4 w-4" />
                           </Button>

                           <span className="rounded bg-black/55 px-2 py-0.5 text-sm text-white">
                              {activeIndex + 1}/{imageUrls.length}
                           </span>

                           <Button
                              isIconOnly
                              size="sm"
                              variant="solid"
                              aria-label="Next image"
                              onClick={goToNext}
                              className="min-w-0 bg-black/55"
                           >
                              <ChevronRight className="h-4 w-4" />
                           </Button>
                        </div>
                     )}
                  </>
               )}

               {!imagesLoading && !hasImages && (
                  <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-gray-400">
                     No images found.
                  </div>
               )}
            </div>
         </div>
      </section>
   )
}