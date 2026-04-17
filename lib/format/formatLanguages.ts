import { CountryProfile } from '@/app/types/countryProfile'
import { N_A_VALUE } from '@/app/constants/strings'
import { MAX_LIST_PREVIEW_COUNT } from '@/app/constants/numbers'

export function formatLanguages(profile: CountryProfile | null): string {
   const languages = profile?.culture.languages ?? []

   if (languages.length === 0) {
      return N_A_VALUE
   }

   const formattedLanguages = languages.slice(0, MAX_LIST_PREVIEW_COUNT).map(language => {
      const languageName = language.name ?? N_A_VALUE
      const nativeName = language.nativeName

      if (nativeName == null || nativeName.length === 0) {
         return languageName
      }

      return `${languageName} (${nativeName})`
   })

   const hiddenCount = languages.length - formattedLanguages.length
   const suffix = hiddenCount > 0 ? ` (+${hiddenCount} more)` : ''

   return `${formattedLanguages.join(', ')}${suffix}`
}