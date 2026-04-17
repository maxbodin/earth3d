import { MAX_LIST_PREVIEW_COUNT } from '@/app/constants/numbers'
import { CountryProfile } from '@/app/types/countryProfile'
import { N_A_VALUE } from '@/app/constants/strings'

export function formatRegionalBlocs(profile: CountryProfile | null): string {
   const blocs = profile?.culture.regionalBlocs ?? []

   if (blocs.length === 0) {
      return N_A_VALUE
   }

   const formattedBlocs = blocs.slice(0, MAX_LIST_PREVIEW_COUNT).map(bloc => {
      const blocName = bloc.name ?? N_A_VALUE
      const blocAcronym = bloc.acronym

      return blocAcronym == null || blocAcronym.length === 0
         ? blocName
         : `${blocName} (${blocAcronym})`
   })

   const hiddenCount = blocs.length - formattedBlocs.length
   const suffix = hiddenCount > 0 ? ` (+${hiddenCount} more)` : ''

   return `${formattedBlocs.join(', ')}${suffix}`
}