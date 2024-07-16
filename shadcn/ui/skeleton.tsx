import { cn } from '@/app/lib/utils'
import React from 'react'


function Skeleton({
                     className,
                     ...props
                  }: React.HTMLAttributes<HTMLDivElement>) {
   return (
      <div
         className={cn('animate-pulse rounded-md bg-slate-100', className)}
         {...props}
      />
   )
}

export { Skeleton }