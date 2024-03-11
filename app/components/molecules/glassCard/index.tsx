import React, { ReactNode } from 'react'
import { CloseButton } from '@/app/components/molecules/closeButton'

export function GlassCard({
   content,
   onClose,
}: {
   content: ReactNode
   onClose: () => void
}) {
   return (
      <div className="absolute top-1/2 right-10 transform -translate-y-1/2 z-50 isolate aspect-video w-96 h-[46rem] rounded-xl bg-white/20 bg-opacity-40 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5">
         <CloseButton className="absolute top-5 right-5" onClick={onClose} />
         <div className="p-8">{content}</div>
      </div>
   )
}
