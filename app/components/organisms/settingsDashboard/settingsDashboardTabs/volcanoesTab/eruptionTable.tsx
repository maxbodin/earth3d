import { useMemo } from 'react'
import { Eruption } from '@/app/types/volcano/eruption'
import { DataTable, DataTableColumn } from '@/lib/ui/dataTable'

type EruptionSortKey = 'country' | 'deaths' | 'vei' | 'year'

const COLUMNS: DataTableColumn<Eruption, EruptionSortKey>[] = [
   {
      key: 'name',
      label: 'Volcano',
      render: e => (
         <span className="text-xs text-white/80 truncate max-w-[140px] block">{e.name}</span>
      ),
   },
   {
      key: 'year',
      label: 'Year',
      sortKey: 'year',
      sortValue: e => e.year ?? -Infinity,
      render: e => (
         <span className="text-xs text-white/70">{e.year ?? '-'}</span>
      ),
   },
   {
      key: 'vei',
      label: 'VEI',
      sortKey: 'vei',
      sortValue: e => e.vei ?? -Infinity,
      render: e => (
         <span className="text-xs font-bold text-white">{e.vei ?? '-'}</span>
      ),
   },
   {
      key: 'country',
      label: 'Country',
      sortKey: 'country',
      sortValue: e => e.country.toLowerCase(),
      render: e => (
         <span className="text-xs text-white/70 truncate max-w-[100px] block">{e.country}</span>
      ),
   },
   {
      key: 'deaths',
      label: 'Deaths',
      sortKey: 'deaths',
      sortValue: e => e.deaths ?? -Infinity,
      render: e => (
         <span className="text-xs text-white/60">
            {e.deaths != null ? e.deaths.toLocaleString() : '-'}
         </span>
      ),
   },
]

function searchFields(e: Eruption): string[] {
   return [e.name, e.country]
}

function getEruptionId(e: Eruption): number {
   return e.id
}

function getEruptionLabel(e: Eruption): string {
   return e.name
}

interface EruptionTableProps {
   eruptionData: Eruption[]
   onFocusEruption: (eruption: Eruption) => void
}

export function EruptionTable({ eruptionData, onFocusEruption }: EruptionTableProps) {
   const columns = useMemo(() => COLUMNS, [])

   return (
      <DataTable<Eruption, EruptionSortKey>
         ariaLabel="Table of volcanic eruptions"
         columns={columns}
         data={eruptionData}
         focusLabel={getEruptionLabel}
         getItemId={getEruptionId}
         onFocus={onFocusEruption}
         searchFields={searchFields}
         searchPlaceholder="Search by name or country..."
      />
   )
}
