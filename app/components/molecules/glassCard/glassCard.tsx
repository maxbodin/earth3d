import React, { ReactNode } from 'react'
import { FadeInOut } from '@/app/components/atoms/ui/fadeInOut/fadeInOut'
import { CloseButton } from '@/app/components/molecules/closeButton/closeButton'

export function GlassCard({
   FadeInOut_isVisible,
   FadeInOut_preFadeOutCallback,
   centered,
   content,
   onClose,
}: {
   FadeInOut_isVisible: boolean
   FadeInOut_preFadeOutCallback: () => void
   centered: boolean
   content: ReactNode
   onClose: () => void
}) {
   return (
      <FadeInOut
         isVisible={FadeInOut_isVisible}
         preFadeOutCallback={FadeInOut_preFadeOutCallback}
      >
         {centered ? (
            <div className="w-fit max-w-screen-xl max-h-screen rounded-xl bg-white/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5 z-40 m-8">
               <div className="p-4">
                  <div className="flex flex-row-reverse">
                     <CloseButton className="z-50" onClick={onClose} />
                     <div className="flex flex-col">{content}</div>
                  </div>
               </div>
            </div>
         ) : (
            <div className="absolute top-1/2 right-10 transform -translate-y-1/2 z-40 isolate aspect-video w-96 h-[46rem] rounded-xl bg-white/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5">
               <CloseButton
                  className="absolute top-5 right-5 z-50"
                  onClick={onClose}
               />
               <div className="p-8">{content}</div>
            </div>
         )}
      </FadeInOut>
   )
}
