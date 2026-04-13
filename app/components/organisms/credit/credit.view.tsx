'use client'
import React from 'react'
import { useUi } from '@/app/context_todo_improve/UIContext'
import { useCredit } from '@/app/components/organisms/credit/credit.model'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import { Button } from '@nextui-org/react'
import { CloseIcon } from '@nextui-org/shared-icons'
import { Alert, AlertDescription, AlertTitle } from '@/shadcn/ui/alert'
import Link from 'next/link'

export function CreditView() {
   const { isCreditOpen, setIsCreditOpen } = useCredit()

   if (!isCreditOpen) {
      return null
   }

   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

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
                     <AlertTitle>Next.js</AlertTitle>
                     <AlertDescription className="flex flex-col space-y-2">
                        <Link href="https://nextjs.org">Next.js</Link>
                     </AlertDescription>
                  </Alert>
                  <Alert>
                     <AlertTitle>Three.js</AlertTitle>
                     <AlertDescription className="flex flex-col space-y-2">
                        <Link href="https://threejs.org">Three.js</Link>
                     </AlertDescription>
                  </Alert>
                  <Alert>
                     <AlertTitle>Tiles displaying on the planet is inspired by geo-three</AlertTitle>
                     <AlertDescription className="flex flex-col space-y-2">
                        <Link href="https://github.com/tentone/geo-three">Geo-Three</Link>
                     </AlertDescription>
                  </Alert>
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
                  <Alert>
                     <AlertTitle>Flickr API</AlertTitle>
                     <AlertDescription>
                        <Link
                           href="https://www.flickr.com/services/api/">Flickr API</Link>
                        <br />
                        <Link
                           href="https://www.flickr.com/services/api/flickr.photos.search.html">Flickr.photos.search</Link>
                     </AlertDescription>
                  </Alert>
                  <Alert>
                     <AlertTitle>Astres Textures</AlertTitle>
                     <AlertDescription>
                        <Link
                           href="https://www.solarsystemscope.com/textures/">Textures</Link>
                        <br />
                        <Link
                           href="https://planetpixelemporium.com/pluto.html">Pluto Texture</Link>
                     </AlertDescription>
                  </Alert>
               </div>
            </div>
         </DrawerContent>
      </Drawer>
   )
}