import { useMemo } from 'react'
import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'
import { formatEpochToLocale } from '@/lib/format/formatEpochToLocale'
import { DataTable, DataTableColumn } from '@/lib/ui/dataTable'

type EarthquakeSortKey = 'depth' | 'mag' | 'time'

const COLUMNS: DataTableColumn<UsgsEarthquakeFeature, EarthquakeSortKey>[] = [
   {
      key: 'title',
      label: 'Title',
      render: f => (
         <span className="text-xs text-white/80 truncate max-w-[180px] block">
            {f.properties.place ?? f.properties.title}
         </span>
      ),
   },
   {
      key: 'mag',
      label: 'Mag',
      sortKey: 'mag',
      sortValue: f => f.properties.mag ?? -Infinity,
      render: f => (
         <span className="text-xs font-bold text-white">{f.properties.mag ?? '-'}</span>
      ),
   },
   {
      key: 'depth',
      label: 'Depth (km)',
      sortKey: 'depth',
      sortValue: f => f.geometry.coordinates[2] ?? -Infinity,
      render: f => (
         <span className="text-xs text-white/70">
            {f.geometry.coordinates[2] != null ? f.geometry.coordinates[2].toFixed(3) : '-'}
         </span>
      ),
   },
   {
      key: 'time',
      label: 'Time',
      sortKey: 'time',
      sortValue: f => f.properties.time,
      render: f => (
         <span className="text-xs text-white/60">{formatEpochToLocale(f.properties.time)}</span>
      ),
   },
]

function getEarthquakeId(f: UsgsEarthquakeFeature): string {
   return f.id
}

function getEarthquakeLabel(f: UsgsEarthquakeFeature): string {
   return f.properties.place ?? f.properties.title
}

interface EarthquakeTableProps {
   earthquakeData: UsgsEarthquakeFeature[]
   onFocusEarthquake: (feature: UsgsEarthquakeFeature) => void
}

export function EarthquakeTable({ earthquakeData, onFocusEarthquake }: EarthquakeTableProps) {
   const columns = useMemo(() => COLUMNS, [])

   return (
      <DataTable<UsgsEarthquakeFeature, EarthquakeSortKey>
         ariaLabel="Table of loaded earthquakes"
         columns={columns}
         data={earthquakeData}
         focusLabel={getEarthquakeLabel}
         getItemId={getEarthquakeId}
         onFocus={onFocusEarthquake}
      />
   )
}
