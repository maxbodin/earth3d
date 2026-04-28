import React from 'react'
import { N_A_VALUE } from '@/app/constants/strings'
import { cn } from '@/lib/cn'
import { FieldItem } from '@/app/types/fieldItem'

export function DataField({
                              label,
                              value,
                              prominent = false,
                           }: FieldItem): React.JSX.Element {
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
