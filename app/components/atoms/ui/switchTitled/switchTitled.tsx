import './styles.css'
import React from 'react'

/**
 * Inspired by https://uiverse.io/mobinkakei/plastic-snail-19
 *
 * @param title
 * @param defaultChecked
 * @param onCheck
 * @param onUncheck
 * @constructor
 */
export function SwitchTitled({
   title,
   defaultChecked,
   onCheck,
   onUncheck,
}: {
   title: string
   defaultChecked: boolean
   onCheck: () => void
   onUncheck: () => void
}) {
   const handleSwitchChange = (
      event: React.ChangeEvent<HTMLInputElement>
   ): void => {
      if (event.target.checked && onCheck) {
         onCheck()
      } else if (!event.target.checked && onUncheck) {
         onUncheck()
      }
   }

   return (
      <div className="p-2">
         <div className="switch-holder">
            <div className="switch-label">
               <span>{title}</span>
            </div>
            <div className="switch-toggle">
               <input
                  type="checkbox"
                  id={title}
                  checked={defaultChecked}
                  onChange={handleSwitchChange}
               />
               <label htmlFor={title}></label>
            </div>
         </div>
      </div>
   )
}
