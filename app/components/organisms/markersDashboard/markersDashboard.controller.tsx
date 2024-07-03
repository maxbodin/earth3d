import { useState } from 'react'
import { Marker } from '@/app/types/marker'

export function MarkersDashboardController() {
   const [rows, setRows] = useState<Marker[]>([])
   const [selectedRows, setSelectedRows] = useState<Marker[]>([])

   const createNewMarker = (): void => {
      // TODO Add limit to 5 or 10 markers max
      setRows([...rows, {
         name: 'My new marker',
         address: 'New Address',
         city: 'Some city',
         country: 'France',
         latitude: 0,
         longitude: 0,
         color: 'Red',
      }])
   }

   return {
      rows,
      selectedRows,
      createNewMarker,
   }
}
