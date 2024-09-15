import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

/**
 * @param tabTitles - Array of strings representing the titles of the tabs.
 * @param onTabClick - Function called when a tab is clicked.
 * @constructor
 */
export function CleanTabs({
                             tabTitles,
                             onTabClick,
                          }: {
   tabTitles: string[]
   onTabClick: (tabName: string) => void
}) {
   const [activeTab, setActiveTab] = useState<number>(0)
   const [highlightHeight, setHighlightHeight] = useState<number>(0)
   const highlightRef = useRef<HTMLDivElement>(null)
   const tabRefs = useRef<(HTMLLabelElement | null)[]>([])

   /**
    * Handle tab click, and update the active tab.
    * @param tabIndex
    * @param tabName
    */
   const handleTabClick = (tabIndex: number, tabName: string): void => {
      setActiveTab(tabIndex)
      onTabClick(tabName)
   }

   useEffect((): void => {
      // Calculate the height of the tab for accurate positioning.
      if (tabRefs.current[activeTab]) {
         const tabHeight = tabRefs.current[activeTab]?.offsetHeight || 0
         setHighlightHeight(tabHeight)
      }
   }, [activeTab, tabTitles])

   return (
      <div className="relative grid place-items-center w-40 h-auto">
         <div
            className="relative w-full h-full grid grid-flow-row auto-rows-fr border-4 border-white/20 bg-white/10 bg-opacity-10 backdrop-blur-md overflow-hidden"
            style={{
               borderWidth: `var(--nextui-border-width-medium)`,
               borderColor: `hsl(var(--nextui-default) / var(--nextui-default-opacity, var(--tw-border-opacity)));`,
               borderRadius: `var(--nextui-radius-large)`,
            }}
         >
            {/* Render the moving highlight background */}
            <div
               ref={highlightRef}
               className="absolute inset-0 bg-white/10 mix-blend-difference transition-transform duration-250 ease-out"
               style={{
                  transform: `translateY(${activeTab * highlightHeight}px)`,
                  height: `${highlightHeight}px`,
               }}
            />
            {tabTitles.map((title, index) => (
               <React.Fragment key={index}>
                  <input
                     type="radio"
                     id={`tab-${index}`}
                     name="tab"
                     className="sr-only"
                     checked={activeTab === index}
                     onChange={() => handleTabClick(index, title)}
                  />
                  <label
                     ref={(el: any) => (tabRefs.current[index] = el)}
                     htmlFor={`tab-${index}`}
                     className={clsx(
                        'cursor-pointer text-center py-3 px-4 transition-colors duration-250 ease-out',
                        activeTab === index
                           ? 'text-white'
                           : 'text-white/50 hover:text-white/80',
                     )}
                     onClick={() => handleTabClick(index, title)}
                  >
                     {title}
                  </label>
               </React.Fragment>
            ))}
         </div>
      </div>
   )
}
