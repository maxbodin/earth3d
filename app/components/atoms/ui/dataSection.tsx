import { FieldItem } from '@/app/types/fieldItem'
import { DataField } from '@/app/components/atoms/ui/dataField'
import React from 'react'

export function DataSection({   title,
                               fields,
                            }: {
   title: string
   fields: FieldItem[]
}): React.JSX.Element {
   return (
      <section className="space-y-1 rounded-lg border border-white/10 bg-black/20 p-3">
         <h2 className="text-lg font-semibold text-white/80">{title}</h2><br/>
         {fields.map((field) => (
            <DataField key={`${title}-${field.label}`} {...field} />
         ))}
      </section>
   )
}