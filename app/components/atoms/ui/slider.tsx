import React, { useId } from 'react'

export function Slider({
   title,
   value,
   min = 0,
   max = 100,
   step = 1,
   onChange,
}: {
   title: string
   value: number
   min?: number
   max?: number
   step?: number
   onChange: (value: number) => void
}) {
   const sliderId = useId()

   return (
      <div
         className="flex justify-between items-center rounded-lg pb-2"
      >
         <div className="pr-5 pl-2.5 shrink-0">
            <span>{title}</span>
         </div>
         <div className="flex items-center gap-2 min-w-0">
            <input
               type="range"
               id={sliderId}
               min={min}
               max={max}
               step={step}
               value={value}
               onChange={(e) => onChange(Number(e.target.value))}
               className="w-24 h-2 appearance-none rounded-full cursor-pointer accent-primary"
            />
            <span className="text-sm tabular-nums w-8 text-right">{value}%</span>
         </div>
      </div>
   )
}
