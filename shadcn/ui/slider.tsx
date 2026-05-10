"use client"

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/cn'

function Slider({
   className,
   defaultValue,
   value,
   min = 0,
   max = 100,
   ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
   const resolvedValue = value ?? defaultValue ?? [min, max]

   return (
      <SliderPrimitive.Root
         data-slot="slider"
         className={cn(
            "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
            className,
         )}
         value={value}
         defaultValue={defaultValue}
         min={min}
         max={max}
         {...props}
      >
         <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/20">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
         </SliderPrimitive.Track>
         {resolvedValue.map((_, index) => (
            <SliderPrimitive.Thumb
               key={index}
               className="block size-4 rounded-full border border-white/40 bg-white shadow-sm ring-offset-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 disabled:pointer-events-none"
            />
         ))}
      </SliderPrimitive.Root>
   )
}

export { Slider }
