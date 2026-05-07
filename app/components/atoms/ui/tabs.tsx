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
            transform: `translateX(${tabRect.left - listRect.left}px)`,
            width: `${tabRect.width}px`,
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
      <div className={clsx('w-full', className)}>
         <div className="rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
            <div ref={tabsListRef} className="relative flex flex-row gap-1">
               <div
                  className="pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-white/15 transition-all duration-200 ease-out"
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
                           'relative z-10 flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200',
                           isActive ? 'text-white' : 'text-white/50 hover:text-white/80',
                        )}
                     >
                        <span className="truncate">{tabTitle}</span>
                     </button>
                  )
               })}
            </div>
         </div>
      </div>
   )
}
