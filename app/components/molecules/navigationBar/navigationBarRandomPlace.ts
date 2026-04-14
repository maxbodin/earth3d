import countriesCoords from '@/app/data/country-codes-lat-long-alpha3.json'
import { Feature, GeocodeResponse } from '@/app/types/orsTypes'
import { reverseORS } from '@/app/server/services/openRouteService'
import { Coordinates } from '@/app/types/coordinates'
import { CountryCoordinateSeed } from '@/app/types/countryCoordinateSeed'
import { RandomLandPlaceResult } from '@/app/types/randomLandPlaceResult'

const RANDOM_PLACE_MAX_ATTEMPTS = 10
const WATER_LAYERS = new Set(['ocean', 'marinearea', 'sea', 'water'])
const WATER_LABEL_PATTERN = /\b(ocean|sea)\b/i

const LAND_COORDINATE_SEEDS: Coordinates[] = (countriesCoords as {
   ref_country_codes: CountryCoordinateSeed[]
}).ref_country_codes
   .filter((seed: CountryCoordinateSeed): boolean => {
      return (
         seed.country !== 'Antarctica'
         && Number.isFinite(seed.latitude)
         && Number.isFinite(seed.longitude)
      )
   })
   .map((seed: CountryCoordinateSeed): Coordinates => {
      return {
         latitude: Number(seed.latitude),
         longitude: Number(seed.longitude),
      }
   })

function isLikelyLandFeature(feature: Feature | null | undefined): boolean {
   if (feature == null || feature.properties == null) return false

   const layer = String(feature.properties.layer ?? '').toLowerCase()
   if (WATER_LAYERS.has(layer)) return false

   const searchableLabel = `${feature.properties.name ?? ''} ${feature.properties.label ?? ''}`
   if (WATER_LABEL_PATTERN.test(searchableLabel)) return false

   const administrativeSignals = [
      feature.properties.country,
      feature.properties.locality,
      feature.properties.region,
      feature.properties.county,
      feature.properties.localadmin,
   ]

   return administrativeSignals.some((signal): boolean => {
      return typeof signal === 'string' && signal.trim().length > 0
   })
}

function getFeatureCoordinates(feature: Feature): Coordinates | null {
   const latitude = Number(feature.geometry?.coordinates?.[1])
   const longitude = Number(feature.geometry?.coordinates?.[0])

   if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null
   }

   return {
      latitude,
      longitude,
   }
}

function pickLandSeedCoordinates(): Coordinates {
   if (LAND_COORDINATE_SEEDS.length === 0) {
      return {
         latitude: Math.random() * 120 - 60,
         longitude: Math.random() * 360 - 180,
      }
   }

   return LAND_COORDINATE_SEEDS[Math.floor(Math.random() * LAND_COORDINATE_SEEDS.length)]
}

export async function getRandomLandPlace(): Promise<RandomLandPlaceResult | null> {
   for (let attempt = 0; attempt < RANDOM_PLACE_MAX_ATTEMPTS; attempt++) {
      const seedCoordinates = pickLandSeedCoordinates()
      const data: GeocodeResponse = await reverseORS(
         seedCoordinates.longitude,
         seedCoordinates.latitude,
      )

      const candidate = data.features?.[0]
      if (!isLikelyLandFeature(candidate)) {
         continue
      }

      return {
         feature: candidate,
         coordinates: getFeatureCoordinates(candidate) ?? seedCoordinates,
      }
   }

   return null
}
