'use client'
import React, { useCallback, useEffect } from 'react'
import { useUi } from '@/app/context/uiContext'
import { useCredit } from '@/app/components/organisms/credit/credit.model'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/shadcn/ui/drawer'
import { Button } from '@nextui-org/react'
import { CloseIcon } from '@nextui-org/shared-icons'
import { CreditGridSkeleton, } from '@/app/components/organisms/credit/creditGridSkeleton'
import { CreditItemCard, } from '@/app/components/organisms/credit/creditItemCard'
import { CreditItem } from '@/app/types/creditItem'

export function CreditView() {
   const { isCreditOpen, setIsCreditOpen } = useCredit()

   const { setIsNavBarDisplayed, setIsSearchBarDisplayed } = useUi()

   const [creditItems, setCreditItems] = React.useState<CreditItem[]>([])
   const [isCreditItemsLoading, setIsCreditItemsLoading] = React.useState<boolean>(false)
   const [creditItemsError, setCreditItemsError] = React.useState<string>('')

   useEffect(() => {
      if (!isCreditOpen) {
         return
      }

      let isCancelled = false

      const loadCreditItems = async (): Promise<void> => {
         setIsCreditItemsLoading(true)
         setCreditItemsError('')

         try {
            const creditItemsModule = await import('@/app/data/creditItems.json')
            if (isCancelled) return

            const loadedItems = Array.isArray(creditItemsModule.default)
               ? creditItemsModule.default as CreditItem[]
               : []

            setCreditItems(loadedItems)
         } catch {
            if (isCancelled) return

            setCreditItems([])
            setCreditItemsError('Unable to load credits at the moment.')
         } finally {
            if (!isCancelled) {
               setIsCreditItemsLoading(false)
            }
         }
      }

      loadCreditItems()

      return (): void => {
         isCancelled = true
      }
   }, [isCreditOpen])

   const restoreMainUi = useCallback((): void => {
      setIsNavBarDisplayed(true)
      setIsSearchBarDisplayed(true)
   }, [setIsNavBarDisplayed, setIsSearchBarDisplayed])

   const handleCreditOpenChange = useCallback((isOpen: boolean): void => {
      setIsCreditOpen(isOpen)

      if (!isOpen) {
         restoreMainUi()
      }
   }, [setIsCreditOpen, restoreMainUi])

   const handleCreditClose = useCallback((): void => {
      handleCreditOpenChange(false)
   }, [handleCreditOpenChange])

   if (!isCreditOpen) {
      return null
   }

   return (
      <Drawer
         dismissible
         onOpenChange={handleCreditOpenChange}
         open={isCreditOpen}
         onClose={handleCreditClose}>
         <DrawerContent
            onInteractOutside={(event): void => {
               handleCreditClose()
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
                        onPress={handleCreditClose}
                        className="absolute top-4 right-4"
                     >
                        <CloseIcon />
                     </Button>
                  </DrawerClose>
               </DrawerHeader>
               <div className="px-8 overflow-auto max-h-[45vh] min-h-[45vh] pb-4 border-gray-700">
                  {isCreditItemsLoading && <CreditGridSkeleton />}

                  {!isCreditItemsLoading && creditItemsError.length > 0 && (
                     <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
                        {creditItemsError}
                     </div>
                  )}

                  {!isCreditItemsLoading && creditItemsError.length === 0 && creditItems.length === 0 && (
                     <div className="rounded-lg border border-white/15 bg-white/[0.04] p-4 text-sm text-white/70">
                        No credit entries configured.
                     </div>
                  )}

                  {!isCreditItemsLoading && creditItems.length > 0 && (
                     <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {creditItems.map((creditItem: CreditItem) => (
                           <CreditItemCard
                              key={creditItem.id}
                              item={creditItem}
                           />
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </DrawerContent>
      </Drawer>
   )
}