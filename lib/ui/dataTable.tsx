'use client'

import React, { ReactNode, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button, Tooltip } from '@nextui-org/react'
import { EyeIcon } from '@nextui-org/shared-icons'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'

const ESTIMATED_ROW_HEIGHT = 40
const OVERSCAN_COUNT = 10

type SortDirection = 'asc' | 'desc'

interface SortState<K extends string> {
   column: K
   direction: SortDirection
}

export interface DataTableColumn<T, K extends string = string> {
   cellClassName?: string
   key: string
   label: string
   render: (item: T) => ReactNode
   sortKey?: K
   sortValue?: (item: T) => number | string
}

interface DataTableProps<T, K extends string> {
   ariaLabel: string
   columns: DataTableColumn<T, K>[]
   data: T[]
   focusLabel?: (item: T) => string
   getItemId: (item: T) => string | number
   onFocus?: (item: T) => void
   searchFields?: (item: T) => string[]
   searchPlaceholder?: string
}

function compareValues(a: number | string, b: number | string, multiplier: number): number {
   if (typeof a === 'string' && typeof b === 'string') return multiplier * a.localeCompare(b)
   return multiplier * ((a as number) - (b as number))
}

function SortIcon<K extends string>({ column, sortState }: { column: K; sortState: SortState<K> | null }) {
   if (sortState?.column !== column) return <ArrowUpDown size={12} strokeWidth={2} className="shrink-0 opacity-40" />
   if (sortState.direction === 'asc') return <ArrowUp size={12} strokeWidth={2} className="shrink-0" />
   return <ArrowDown size={12} strokeWidth={2} className="shrink-0" />
}

function DataTableInner<T, K extends string>(
   {
      ariaLabel,
      columns,
      data,
      focusLabel,
      getItemId,
      onFocus,
      searchFields,
      searchPlaceholder,
   }: DataTableProps<T, K>,
) {
   const scrollContainerRef = useRef<HTMLDivElement>(null)
   const [sortState, setSortState] = useState<SortState<K> | null>(null)
   const [searchQuery, setSearchQuery] = useState('')

   const hasSearch = searchFields != null
   const hasActions = onFocus != null
   const columnCount = columns.length + (hasActions ? 1 : 0)

   const filteredData = useMemo(() => {
      if (!hasSearch) return data
      const query = searchQuery.trim().toLowerCase()
      if (query.length === 0) return data
      return data.filter(item =>
         searchFields(item).some(field => field.toLowerCase().includes(query)),
      )
   }, [data, searchQuery, hasSearch, searchFields])

   const sortedData = useMemo(() => {
      if (sortState == null) return filteredData
      const { column, direction } = sortState
      const multiplier = direction === 'asc' ? 1 : -1
      const sortColumn = columns.find(c => c.sortKey === column)
      if (sortColumn?.sortValue == null) return filteredData
      const getValue = sortColumn.sortValue
      return [...filteredData].sort((a, b) =>
         compareValues(getValue(a), getValue(b), multiplier),
      )
   }, [filteredData, sortState, columns])

   const toggleSort = (column: K): void => {
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
      <div className="flex flex-col gap-2">
         {hasSearch && (
            <div className="relative">
               <Search size={12} strokeWidth={2} className="absolute top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" style={{ left: 12 }} />
               <input
                  type="text"
                  placeholder={searchPlaceholder ?? 'Search...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 py-1.5 pr-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/40"
                  style={{ paddingLeft: 36 }}
               />
            </div>
         )}
         <div
            ref={scrollContainerRef}
            className="overflow-auto max-h-[25vh] rounded-lg border border-white/20"
         >
            <table className="w-full text-left" aria-label={ariaLabel}>
               <thead className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
                  <tr>
                     {columns.map(col => (
                        <th
                           key={col.key}
                           className={`px-3 py-2 text-xs text-white/60 font-medium${
                              col.sortKey != null ? ' cursor-pointer select-none hover:text-white/90' : ''
                           }`}
                           onClick={col.sortKey != null ? () => toggleSort(col.sortKey!) : undefined}
                        >
                           <span className={col.sortKey != null ? 'inline-flex items-center gap-2' : undefined}>
                              {col.label}
                              {col.sortKey != null && (
                                 <SortIcon column={col.sortKey} sortState={sortState} />
                              )}
                           </span>
                        </th>
                     ))}
                     {hasActions && (
                        <th className="px-3 py-2 text-xs text-white/60 font-medium text-center">Actions</th>
                     )}
                  </tr>
               </thead>
               <tbody>
                  {paddingTop > 0 && (
                     <tr><td colSpan={columnCount} style={{ height: paddingTop }} /></tr>
                  )}
                  {virtualRows.map((virtualRow) => {
                     const item = sortedData[virtualRow.index]
                     return (
                        <tr
                           key={getItemId(item)}
                           className="border-b border-white/10 hover:bg-white/5"
                        >
                           {columns.map(col => (
                              <td key={col.key} className={col.cellClassName ?? 'px-3 py-2'}>
                                 {col.render(item)}
                              </td>
                           ))}
                           {hasActions && (
                              <td className="px-3 py-2 text-center">
                                 <Tooltip content="Focus on map">
                                    <Button
                                       isIconOnly
                                       size="sm"
                                       variant="light"
                                       aria-label={`Focus on ${focusLabel?.(item) ?? ''}`}
                                       onPress={() => onFocus!(item)}
                                    >
                                       <EyeIcon />
                                    </Button>
                                 </Tooltip>
                              </td>
                           )}
                        </tr>
                     )
                  })}
                  {paddingBottom > 0 && (
                     <tr><td colSpan={columnCount} style={{ height: paddingBottom }} /></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
   )
}

export const DataTable = React.memo(DataTableInner) as typeof DataTableInner
