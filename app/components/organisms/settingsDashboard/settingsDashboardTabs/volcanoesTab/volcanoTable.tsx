import { useMemo } from 'react'
import { Volcano } from '@/app/types/volcano/volcano'
import { DataTable, DataTableColumn } from '@/lib/ui/dataTable'

type VolcanoSortKey = 'country' | 'elevation' | 'eruptionCount' | 'lastEruptionYear'

const COLUMNS: DataTableColumn<Volcano, VolcanoSortKey>[] = [
   {
      key: 'name',
      label: 'Name',
      render: v => (
         <span className="text-xs text-white/80 truncate max-w-[140px] block">{v.name}</span>
      ),
   },
   {
      key: 'type',
      label: 'Type',
      render: v => (
         <span className="text-xs text-white/70 truncate max-w-[100px] block">{v.type ?? '-'}</span>
      ),
   },
   {
      key: 'country',
      label: 'Country',
      sortKey: 'country',
      sortValue: v => v.country.toLowerCase(),
      render: v => (
         <span className="text-xs text-white/70 truncate max-w-[100px] block">{v.country}</span>
      ),
   },
   {
      key: 'elevation',
      label: 'Elev. (m)',
      sortKey: 'elevation',
      sortValue: v => v.elevationMeters ?? -Infinity,
      render: v => (
         <span className="text-xs text-white/70">
            {v.elevationMeters != null ? v.elevationMeters.toLocaleString() : '-'}
         </span>
      ),
   },
   {
      key: 'lastEruptionYear',
      label: 'Last Eruption',
      sortKey: 'lastEruptionYear',
      sortValue: v => v.lastEruptionYear ?? -Infinity,
      render: v => (
         <span className="text-xs text-white/60">{v.lastEruptionYear ?? '-'}</span>
      ),
   },
]

function searchFields(v: Volcano): string[] {
   return [v.name, v.country, v.type]
}

function getVolcanoId(v: Volcano): number {
   return v.id
}

function getVolcanoLabel(v: Volcano): string {
   return v.name
}

interface VolcanoTableProps {
   onFocusVolcano: (volcano: Volcano) => void
   volcanoData: Volcano[]
}

export function VolcanoTable({ onFocusVolcano, volcanoData }: VolcanoTableProps) {
   const columns = useMemo(() => COLUMNS, [])

   return (
      <DataTable<Volcano, VolcanoSortKey>
         ariaLabel="Table of loaded volcanoes"
         columns={columns}
         data={volcanoData}
         focusLabel={getVolcanoLabel}
         getItemId={getVolcanoId}
         onFocus={onFocusVolcano}
         searchFields={searchFields}
         searchPlaceholder="Search by name, type, or country..."
      />
   )
}
