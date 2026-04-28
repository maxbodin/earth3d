import React, { useId } from 'react'

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
   const switchId = useId()

   const handleSwitchChange = (
      event: React.ChangeEvent<HTMLInputElement>,
   ): void => {
      if (event.target.checked && onCheck) {
         onCheck()
      } else if (!event.target.checked && onUncheck) {
         onUncheck()
      }
   }

   return (
      <div className="pb-2">
         <div
            className="flex justify-between items-center rounded-lg text-black"
            style={{
               padding: '10px 20px',
               boxShadow: '10px 10px 10px rgba(0,0,0,.2), inset 10px 10px 10px rgba(0,0,0,.2)',
               background: 'white',
            }}
         >
            <div className="pr-5 pl-2.5">
               <span>{title}</span>
            </div>
            <div className="h-10 relative">
               <input
                  type="checkbox"
                  id={switchId}
                  checked={defaultChecked}
                  onChange={handleSwitchChange}
                  className="absolute opacity-0"
               />
               <label
                  htmlFor={switchId}
                  className="relative inline-block w-[100px] h-10 rounded-[20px] m-0 cursor-pointer"
                  style={{
                     boxShadow: 'inset -8px -8px 15px rgba(255,255,255,.6), inset 10px 10px 10px rgba(0,0,0,.25)',
                  }}
               >
                  <span
                     className="absolute text-[13px] text-center text-white rounded-[20px]"
                     style={{
                        top: 8,
                        left: defaultChecked ? '47%' : 8,
                        width: 45,
                        height: 25,
                        lineHeight: '25px',
                        backgroundColor: defaultChecked ? '#00b33c' : '#ff0000',
                        boxShadow: defaultChecked
                           ? '-2px -2px 5px rgba(255,255,255,.5), 2px 2px 5px #00b33c'
                           : '-2px -2px 5px rgba(255,255,255,.5), 2px 2px 5px #ff0000',
                        transition: '.3s ease-in-out',
                     }}
                  >
                     {defaultChecked ? 'Yes' : 'No'}
                  </span>
               </label>
            </div>
         </div>
      </div>
   )
}
