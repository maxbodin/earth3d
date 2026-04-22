import { CountryProfile } from '@/app/types/countryProfile'
import { N_A_VALUE } from '@/app/constants/strings'
import { MAX_LIST_PREVIEW_COUNT } from '@/app/constants/numbers'

export function formatTranslations(profile: CountryProfile | null): string {
   const translations = profile?.culture.translations ?? {}
   const entries = Object.entries(translations)

   if (entries.length === 0) {
      return N_A_VALUE
   }

   const visibleEntries = entries.slice(0, MAX_LIST_PREVIEW_COUNT)
   const hiddenCount = entries.length - visibleEntries.length
   const suffix = hiddenCount > 0 ? ` (+${hiddenCount} more)` : ''

   return `${visibleEntries.map(([key, value]) => `${key}: ${value}`).join(', ')}${suffix}`
}