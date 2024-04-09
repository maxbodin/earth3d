import React from 'react'
import './styles.css'

/**
 * Inspired by https://uiverse.io/Admin12121/cold-bobcat-20
 * @param tabTitles
 * @param onTabClick
 * @constructor
 */
export function Tabs({
   tabTitles,
   onTabClick,
}: {
   tabTitles: string[]
   onTabClick: (tabName: string) => void
}) {
   const handleTabClick = (tabName: string): void => {
      onTabClick(tabName)
   }

   const renderTabs = () => {
      return tabTitles.map((title: string, index: number) => (
         <React.Fragment key={index}>
            <input
               value={title}
               name="fav_language"
               id={`tab-${index}`}
               type="radio"
               className="input"
            />
            <label
               htmlFor={`tab-${index}`}
               className="label"
               onClick={() => handleTabClick(title)}
            >
               {title}
            </label>
         </React.Fragment>
      ))
   }

   return (
      <div className="body z-40">
         <div className="tabs bg-white/20 bg-opacity-40 border-4 border-solid border-white/20 backdrop-blur-md drop-shadow-lg ring-1 ring-black/5">
            {renderTabs()}
         </div>
      </div>
   )
}
