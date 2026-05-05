import React, { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'
import { Button, Tooltip } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { formatEpochToLocale } from '@/lib/format/formatEpochToLocale'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

const ESTIMATED_ROW_HEIGHT = 40
const OVERSCAN_COUNT = 10
const COLUMN_COUNT = 5

type SortableColumn = 'mag' | 'depth' | 'time'
type SortDirection = 'asc' | 'desc'

interface SortState {
   column: SortableColumn
   direction: SortDirection
}

function getColumnValue(feature: UsgsEarthquakeFeature, column: SortableColumn): number {
   switch (column) {
      case 'mag': return feature.properties.mag ?? -Infinity
      case 'depth': return feature.geometry.coordinates[2] ?? -Infinity
      case 'time': return feature.properties.time
   }
}

function SortIcon({ column, sortState }: { column: SortableColumn; sortState: SortState | null }) {
   if (sortState?.column !== column) return <ArrowUpDown className="inline-block ml-1 size-3 opacity-40" />
   if (sortState.direction === 'asc') return <ArrowUp className="inline-block ml-1 size-3" />
   return <ArrowDown className="inline-block ml-1 size-3" />
}

interface EarthquakeTableProps {
   earthquakeData: UsgsEarthquakeFeature[]
   onFocusEarthquake: (feature: UsgsEarthquakeFeature) => void
}

export const EarthquakeTable = React.memo(function EarthquakeTable({
   earthquakeData,
   onFocusEarthquake,
}: EarthquakeTableProps) {
   const scrollContainerRef = useRef<HTMLDivElement>(null)
   const [sortState, setSortState] = useState<SortState | null>(null)

   const sortedData = useMemo(() => {
      if (sortState == null) return earthquakeData
      const { column, direction } = sortState
      const multiplier = direction === 'asc' ? 1 : -1
      return [...earthquakeData].sort((a, b) =>
         multiplier * (getColumnValue(a, column) - getColumnValue(b, column)),
      )
   }, [earthquakeData, sortState])

   const toggleSort = (column: SortableColumn): void => {
      setSortState(prev => {
         if (prev?.column !== column) return { column, direction: 'asc' }
         if (prev.direction === 'asc') return { column, direction: 'desc' }
         return null
      })
   }

   const virtualizer = useVirtualizer({
      count: sortedData.length,
      getScrollElement: () => scrollContainerRef.current,
      estimateSize: () => ESTIMATED_ROW_HEIGHT,
      overscan: OVERSCAN_COUNT,
   })

   const virtualRows = virtualizer.getVirtualItems()
   const totalSize = virtualizer.getTotalSize()
   const paddingTop = virtualRows[0]?.start ?? 0
   const paddingBottom = totalSize - (virtualRows.at(-1)?.end ?? 0)

   return (
      <div
         ref={scrollContainerRef}
         className="overflow-auto max-h-[25vh] rounded-lg border border-white/20"
      >
         <table className="w-full text-left" aria-label="Table of loaded earthquakes">
            <thead className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
               <tr>
                  <th className="px-3 py-2 text-xs text-white/60 font-medium">Title</th>
                  <th
                     className="px-3 py-2 text-xs text-white/60 font-medium cursor-pointer select-none hover:text-white/90"
                     onClick={() => toggleSort('mag')}
                  >
                     Mag <SortIcon column="mag" sortState={sortState} />
                  </th>
                  <th
                     className="px-3 py-2 text-xs text-white/60 font-medium cursor-pointer select-none hover:text-white/90"
                     onClick={() => toggleSort('depth')}
                  >
                     Depth (km) <SortIcon column="depth" sortState={sortState} />
                  </th>
                  <th
                     className="px-3 py-2 text-xs text-white/60 font-medium cursor-pointer select-none hover:text-white/90"
                     onClick={() => toggleSort('time')}
                  >
                     Time <SortIcon column="time" sortState={sortState} />
                  </th>
                  <th className="px-3 py-2 text-xs text-white/60 font-medium text-center">Actions</th>
               </tr>
            </thead>
            <tbody>
               {paddingTop > 0 && (
                  <tr><td colSpan={COLUMN_COUNT} style={{ height: paddingTop }} /></tr>
               )}
               {virtualRows.map((virtualRow) => {
                  const feature = sortedData[virtualRow.index]
                  return (
                     <tr
                        key={feature.id}
                        className="border-b border-white/10 hover:bg-white/5"
                     >
                        <td className="px-3 py-2">
                           <span className="text-xs text-white/80 truncate max-w-[180px] block">
                              {feature.properties.place ?? feature.properties.title}
                           </span>
                        </td>
                        <td className="px-3 py-2">
                           <span className="text-xs font-bold text-white">
                              {feature.properties.mag ?? '-'}
                           </span>
                        </td>
                        <td className="px-3 py-2">
                           <span className="text-xs text-white/70">
                              {feature.geometry.coordinates[2] ?? '-'}
                           </span>
                        </td>
                        <td className="px-3 py-2">
                           <span className="text-xs text-white/60">
                              {formatEpochToLocale(feature.properties.time)}
                           </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                           <Tooltip content="Focus on map">
                              <Button
                                 isIconOnly
                                 size="sm"
                                 variant="light"
                                 aria-label={`Focus on ${feature.properties.place ?? feature.properties.title}`}
                                 onPress={() => onFocusEarthquake(feature)}
                              >
                                 <EyeIcon />
                              </Button>
                           </Tooltip>
                        </td>
                     </tr>
                  )
               })}
               {paddingBottom > 0 && (
                  <tr><td colSpan={COLUMN_COUNT} style={{ height: paddingBottom }} /></tr>
               )}
            </tbody>
         </table>
      </div>
   )
})
