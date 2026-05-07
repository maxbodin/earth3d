'use client'

import { forwardRef, useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useForwardedRef } from '@/lib/useForwardRef'
import { Input } from '@nextui-org/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/ui/popover'
import { cn } from '@/lib/cn'

interface ColorPickerProps {
   value: string;
   onChange: (value: string) => void;
   onBlur?: () => void;
   isDisabled?: boolean;
   className?: string;
   name?: string;
}

const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
   ({ isDisabled, value, onChange, onBlur, name, className }, forwardedRef) => {
      const ref = useForwardedRef(forwardedRef)
      const [open, setOpen] = useState<boolean>(false)

      const parsedValue: string = useMemo(() => {
         return value?.replace('0x', '#') || '#FFFFFF'
      }, [value])

      return (
         <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild disabled={isDisabled} onBlur={onBlur}>
               <button
                  type="button"
                  disabled={isDisabled}
                  className={cn(
                     'h-8 w-8 min-w-8 rounded-lg border-2 border-white/20 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50',
                     className,
                  )}
                  name={name}
                  style={{ backgroundColor: parsedValue }}
               />
            </PopoverTrigger>
            <PopoverContent className="w-full flex flex-col items-center">
               <HexColorPicker color={parsedValue} onChange={onChange} />
               <Input
                  className="pt-4"
                  maxLength={7}
                  onChange={(e) => {
                     onChange(e?.currentTarget?.value)
                  }}
                  ref={ref}
                  value={parsedValue}
               />
            </PopoverContent>
         </Popover>
      )
   },
)
ColorPicker.displayName = 'ColorPicker'

export { ColorPicker }