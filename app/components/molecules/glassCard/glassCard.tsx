import { ReactNode } from 'react'
import { Button } from '@nextui-org/react'
import { CloseIcon } from '@nextui-org/shared-icons'

// TODO : refactor or delete.
export function GlassCard({
                             isVisible,
                             content,
                             onClose,
                          }: {
   isVisible: boolean
   content: ReactNode
   onClose: () => void
}) {
   return (
      <div
         data-map-pick-ignore="true"
         className={`absolute top-1/2 right-10 transform -translate-y-1/2 z-40 isolate aspect-video w-96 h-fit rounded-xl bg-black bg-opacity-40 backdrop-blur-md drop-shadow-lg pr-2 border-medium border-default transition-opacity duration-150 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
         }`}>
         <Button
            variant="bordered"
            isIconOnly
            size="sm"
            aria-label="Close"
            onPress={onClose}
            className="absolute top-2 right-2 z-50 bg-black bg-opacity-50"
         >
            <CloseIcon />
         </Button>
         <div className="p-4 max-h-[70vh] overflow-y-auto">{content}</div>
      </div>
   )
}