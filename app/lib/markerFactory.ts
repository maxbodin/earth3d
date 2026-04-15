import { Feature } from '@/app/types/orsTypes'
import { Marker } from '@/app/types/marker'
import { getRandomVibrantColor } from '@/app/lib/utils'

function generateMarkerId(): string {
   return `marker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function createMarkerFromPlaceFeature(feature: Feature): Marker | null {
   const coordinates = feature.geometry?.coordinates

   if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return null
   }

   const longitude = coordinates[0]
   const latitude = coordinates[1]

   if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null
   }

   return {
      id: generateMarkerId(),
      selection: 'selection',
      name: feature.properties?.name ?? '',
      address: feature.properties?.label ?? '',
      latitude,
      longitude,
      color: getRandomVibrantColor(),
      actions: 'actions',
      isPuck: false,
   }
}
