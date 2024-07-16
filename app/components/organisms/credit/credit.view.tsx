import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { useCredit } from '@/app/components/organisms/credit/credit.model'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import { Button } from '@nextui-org/react'
import { CloseIcon } from '@nextui-org/shared-icons'
import { Alert, AlertDescription, AlertTitle } from '@/shadcn/ui/alert'
import Link from 'next/link'

export function CreditView() {
   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const { isCreditOpen, setIsCreditOpen } = useCredit()

   return (
      <Drawer
         dismissible={false}
         onOpenChange={setIsCreditOpen}
         open={isCreditOpen}
         onClose={(): void => {
            setIsNavBarDisplayed(true)
            setIsSearchBarDisplayed(true)
         }}>
         <DrawerContent
            onInteractOutside={(event): void => {
               setIsNavBarDisplayed(true)
               setIsSearchBarDisplayed(true)
               event.stopPropagation()
               event.preventDefault()
            }}
         >
            <div className="mx-auto w-full">
               <DrawerHeader className="flex justify-between items-center">
                  <div>
                     <DrawerTitle>✨ Credit</DrawerTitle>
                  </div>
                  <DrawerClose asChild>
                     <Button
                        variant="bordered"
                        isIconOnly
                        size="sm"
                        aria-label="Close"
                        onClick={(): void => {
                           setIsCreditOpen(false)
                        }}
                        className="absolute top-4 right-4"
                     >
                        <CloseIcon />
                     </Button>
                  </DrawerClose>
               </DrawerHeader>
               <div className="px-8 overflow-auto max-h-[45vh] min-h-[45vh] space-y-4 border-gray-700">
                  <Alert>
                     <AlertTitle>Autocomplete</AlertTitle>
                     <AlertDescription className="flex flex-col space-y-2">
                        <Link href="https://cmdk.paco.me/">CMDK</Link>
                        <Link href="https://github.com/pacocoursey/cmdk">CMDK GitHub</Link>
                     </AlertDescription>
                  </Alert>
                  <Alert>
                     <AlertTitle>Color Picker</AlertTitle>
                     <AlertDescription>
                        <Link
                           href="https://github.com/nightspite/shadcn-color-picker/blob/master/src/components/ui/color-picker.tsx">Color
                           Picker GitHub</Link>
                     </AlertDescription>
                  </Alert>
               </div>
            </div>
         </DrawerContent>
      </Drawer>
   )
}