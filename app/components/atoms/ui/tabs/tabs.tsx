import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

interface TabsProps {
   selectedTabIndex: number
   tabTitles: string[]
   onTabSelect: (tabIndex: number) => void
   className?: string
}

const clampIndex = (index: number, size: number): number => {
   if (size <= 0) return 0
   return Math.max(0, Math.min(index, size - 1))
}

export function Tabs({
                         selectedTabIndex,
                         tabTitles,
                         onTabSelect,
                         className,
                      }: TabsProps) {
   const tabsListRef = useRef<HTMLDivElement | null>(null)
   const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
   const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0 })

   const activeTabIndex = useMemo((): number => {
      return clampIndex(selectedTabIndex, tabTitles.length)
   }, [selectedTabIndex, tabTitles.length])

   useEffect((): (() => void) => {
      const updateIndicator = (): void => {
         const activeTabElement = tabRefs.current[activeTabIndex]
         const tabsListElement = tabsListRef.current

         if (!activeTabElement || !tabsListElement) {
            setIndicatorStyle({ opacity: 0 })
            return
         }

         const tabRect = activeTabElement.getBoundingClientRect()
         const listRect = tabsListElement.getBoundingClientRect()

         setIndicatorStyle({
            opacity: 1,
            transform: `translateY(${tabRect.top - listRect.top}px)`,
            height: `${tabRect.height}px`,
         })
      }

      updateIndicator()
      window.addEventListener('resize', updateIndicator)

      return (): void => {
         window.removeEventListener('resize', updateIndicator)
      }
   }, [activeTabIndex, tabTitles])

   return (
      <div className={clsx('w-56', className)}>
         <div className="rounded-2xl border border-black/20 bg-white p-2 shadow-md">
            <div ref={tabsListRef} className="relative flex flex-col gap-1">
               <div
                  className="pointer-events-none absolute left-0 right-0 top-0 z-0 rounded-xl bg-black transition-all duration-200 ease-out"
                  style={indicatorStyle}
               />

               {tabTitles.map((tabTitle: string, index: number) => {
                  const isActive = index === activeTabIndex

                  return (
                     <button
                        key={`${tabTitle}-${index}`}
                        ref={(element: HTMLButtonElement | null): void => {
                           tabRefs.current[index] = element
                        }}
                        type="button"
                        onClick={(): void => onTabSelect(index)}
                        className={clsx(
                           'relative z-10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200',
                           isActive ? 'text-white' : 'text-black/70 hover:text-black',
                        )}
                     >
                        <span
                           className={clsx(
                              'h-2 w-2 rounded-full transition-colors duration-200',
                              isActive ? 'bg-white' : 'bg-black/35',
                           )}
                        />
                        <span className="truncate">{tabTitle}</span>
                     </button>
                  )
               })}
            </div>
         </div>
      </div>
   )
}
