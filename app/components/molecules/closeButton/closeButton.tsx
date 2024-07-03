import { Button } from '../../atoms/ui/button/button'
import React from 'react'
import { CloseIcon } from '@/app/components/icons/closeIcon'

export function CloseButton({
                               onClick,
                               className = '',
                            }: {
   onClick: () => void
   className?: string
}) {
   const handleClick = (): void => {
      onClick()
   }

   return (
      <div className={`${className}`}>
         <Button onClick={handleClick} svg={<CloseIcon />} message={'Close'} />
      </div>
   )
}
