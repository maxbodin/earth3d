'use client'

import { forwardRef, useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/app/lib/utils'
import { Button, ButtonProps } from '@nextui-org/react'
import { useForwardedRef } from '@/app/lib/useForwardRef'
import { Input } from '@nextui-org/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/ui/popover'

interface ColorPickerProps {
   value: string;
   onChange: (value: string) => void;
   onBlur?: () => void;
}

const ColorPicker = forwardRef<
   HTMLInputElement,
   Omit<ButtonProps, 'value' | 'onChange' | 'onBlur'> & ColorPickerProps
>(
   (
      { disabled, value, onChange, onBlur, name, className, ...props },
      forwardedRef,
   ) => {
      const ref = useForwardedRef(forwardedRef)
      const [open, setOpen] = useState(false)

      const parsedValue: string = useMemo(() => {
         return value || '#FFFFFF'
      }, [value])

      return (
         <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
               <Button
                  {...props}
                  className={cn('block w-8 min-w-8 max-w-8', className)}
                  name={name}
                  onClick={(): void => {
                     setOpen(true)
                  }}
                  size="sm"
                  style={{
                     backgroundColor: parsedValue,
                  }}
                  variant="bordered"
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