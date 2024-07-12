import { CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Command as CommandPrimitive } from 'cmdk'
import { type KeyboardEvent, useCallback, useRef, useState } from 'react'

import { Skeleton } from './skeleton'

import { Check } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export type Option = Record<'value' | 'label', string> & Record<string, string>

type AutoCompleteProps = {
   options: Option[]
   emptyMessage: string
   value?: Option
   onSelectionChange?: (option: Option) => void
   onInputChange?: (value: string) => void
   isLoading?: boolean
   disabled?: boolean
   placeholder?: string
}

/**
 * Inspired by https://armand-salle.fr/post/autocomplete-select-shadcn-ui/
 *
 * @param options
 * @param placeholder
 * @param emptyMessage
 * @param value
 * @param onSelectionChange
 * @param onInputChange
 * @param disabled
 * @param isLoading
 * @constructor
 */
export const AutoComplete = ({
                                options,
                                placeholder,
                                emptyMessage,
                                value,
                                onSelectionChange,
                                onInputChange,
                                disabled,
                                isLoading = false,
                             }: AutoCompleteProps) => {
   const inputRef = useRef<HTMLInputElement>(null)

   const [isOpen, setOpen] = useState<boolean>(false)

   const [selected, setSelected] = useState<Option>(value as Option)

   const [inputValue, setInputValue] = useState<string>(value?.label || '')

   const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>): void => {
         const input = inputRef.current

         if (!input) {
            return
         }

         // Keep the options displayed when the user is typing.
         if (!isOpen) {
            setOpen(true)
         }

         // This is not a default behaviour of the <input /> field.
         if (event.key === 'Enter' && input.value !== '') {
            const optionToSelect = options.find(
               (option: Option): boolean => option.label === input.value,
            )
            if (optionToSelect) {
               setSelected(optionToSelect)
               onSelectionChange?.(optionToSelect)
            }
         }
      },
      [isOpen, options, onSelectionChange],
   )

   const handleBlur = useCallback(() => {
      setOpen(false)
      setInputValue(selected?.label)
   }, [selected])

   const handleSelectOption = useCallback(
      (selectedOption: Option): void => {
         setInputValue(selectedOption.label)

         setSelected(selectedOption)

         onSelectionChange?.(selectedOption)

         // This is a hack to prevent the input from being focused after the user selects an option.
         // We can call this hack: "The next tick".
         setTimeout(() => {
            inputRef?.current?.blur()
         }, 0)
      },
      [onSelectionChange],
   )

   const handleInputChange = useCallback(
      (newValue: string): void => {
         setInputValue(newValue)
         onInputChange?.(newValue)
      },
      [onInputChange],
   )

   return (
      <CommandPrimitive onKeyDown={handleKeyDown}>
         <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={isLoading ? undefined : handleInputChange}
            onBlur={handleBlur}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="text-base border-none"
         />
         {isOpen && (
            <div
               className={cn(
                  'absolute left-0 w-full rounded-xl bg-background shadow-lg mt-2 z-50',
               )}
            >
               <CommandList className="rounded-lg">
                  {isLoading ? (
                     <CommandPrimitive.Loading>
                        <div className="p-1">
                           <Skeleton className="h-8 w-full" />
                        </div>
                     </CommandPrimitive.Loading>
                  ) : null}
                  {options.length > 0 && !isLoading ? (
                     <CommandGroup>
                        {options.map((option: Option) => {
                           const isSelected: boolean = selected?.value === option.value
                           return (
                              <CommandItem
                                 key={option.value}
                                 value={option.label}
                                 onMouseDown={(event: any): void => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                 }}
                                 onSelect={() => handleSelectOption(option)}
                                 className={cn(
                                    'flex w-full items-center gap-2 cursor-pointer p-2',
                                    !isSelected ? 'pl-8' : null,
                                 )}
                              >
                                 {isSelected ? <Check className="w-4" /> : null}
                                 {option.label}
                              </CommandItem>
                           )
                        })}
                     </CommandGroup>
                  ) : null}
                  {!isLoading ? (
                     <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                        {emptyMessage}
                     </CommandPrimitive.Empty>
                  ) : null}
               </CommandList>
            </div>)}
      </CommandPrimitive>
   )
}