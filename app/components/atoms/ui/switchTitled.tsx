import { Switch } from '@nextui-org/react'
import { useCallback } from 'react'

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
   const handleValueChange = useCallback((isSelected: boolean): void => {
      if (isSelected) {
         onCheck()
      } else {
         onUncheck()
      }
   }, [onCheck, onUncheck])

   return (
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 mb-2 backdrop-blur-sm">
         <span className="text-sm text-white/90">{title}</span>
         <Switch
            size="sm"
            isSelected={defaultChecked}
            onValueChange={handleValueChange}
            aria-label={title}
         />
      </div>
   )
}
