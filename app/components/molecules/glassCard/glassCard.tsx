import React, { ReactNode } from 'react'
import { FadeInOut } from '@/app/components/atoms/ui/fadeInOut/fadeInOut'
import { Button } from '@nextui-org/react'
import { CloseIcon } from '@nextui-org/shared-icons'

export function GlassCard({
                             FadeInOut_isVisible,
                             FadeInOut_preFadeOutCallback,
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
         <div
            className="absolute top-1/2 right-10 transform -translate-y-1/2 z-40 isolate aspect-video w-96 h-[46rem] rounded-xl bg-black bg-opacity-40 backdrop-blur-md drop-shadow-lg pr-4 border-medium border-default">
            <Button
               variant="bordered"
               isIconOnly
               size="sm"
               aria-label="Close"
               onClick={onClose}
               className="absolute top-5 right-5 z-50 bg-black bg-opacity-50"
            >
               <CloseIcon />
            </Button>
            <div className="p-8">{content}</div>
         </div>
      </FadeInOut>
   )
}