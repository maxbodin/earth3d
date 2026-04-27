import React from 'react'
import { N_A_VALUE } from '@/app/constants/strings'
import { cn } from '@/lib/cn'
import { PlaceFieldItem } from '@/app/types/placeFieldItem'

export function PlaceField({
                              label,
                              value,
                              prominent = false,
                           }: PlaceFieldItem): React.JSX.Element {
   const hasValue = value !== N_A_VALUE

   return (
      <p
         className={cn(
            prominent ? 'text-md font-semibold' : 'text-sm font-medium',
            hasValue ? 'text-white/90' : 'text-gray-400',
         )}
      >
         {label}: {value}
      </p>
   )
}
