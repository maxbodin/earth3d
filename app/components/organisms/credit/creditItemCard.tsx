import React from 'react'
import { CreditItem } from '@/app/types/creditItem'
import { Link } from '@/app/components/atoms/ui/link'

interface CreditItemCardProps {
   item: CreditItem
}

export function CreditItemCard({ item }: CreditItemCardProps): React.JSX.Element {
   return (
      <article className="flex h-full min-h-[180px] flex-col justify-between rounded-lg border border-white/15 bg-white/[0.04] p-4 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.08]">
         <div className="space-y-2">
            <h3 className="text-base font-semibold text-white/95">{item.title}</h3>
            <p className="text-sm leading-relaxed text-white/65">{item.description}</p>
         </div>

         <div className="mt-4 space-y-2">
            {item.tags != null && item.tags.length > 0 && (
               <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag: string) => (
                     <span
                        key={tag}
                        className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-sm uppercase tracking-wide text-white/70"
                     >
                        {tag}
                     </span>
                  ))}
               </div>
            )}

            <div className="flex flex-col gap-1">
               {item.links.map((linkItem) => (
                  <Link
                     key={`${item.id}-${linkItem.url}`}
                     link={linkItem.url}
                     title={linkItem.label}
                  />
               ))}
            </div>
         </div>
      </article>
   )
}
