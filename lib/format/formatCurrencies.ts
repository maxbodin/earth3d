import { N_A_VALUE } from '@/app/constants/strings'
import { CountryProfile } from '@/app/types/countryProfile'
import { MAX_LIST_PREVIEW_COUNT } from '@/app/constants/numbers'

export function formatCurrencies(profile: CountryProfile | null): string {
   const currencies = profile?.economy.currencies ?? []

   if (currencies.length === 0) {
      return N_A_VALUE
   }

   const formattedCurrencies = currencies.slice(0, MAX_LIST_PREVIEW_COUNT).map(currency => {
      const currencyName = currency.name ?? N_A_VALUE
      const currencyCode = currency.code ?? N_A_VALUE
      const currencySymbol = currency.symbol ?? '?'

      return `${currencyName} (${currencyCode}, ${currencySymbol})`
   })

   const hiddenCount = currencies.length - formattedCurrencies.length
   const suffix = hiddenCount > 0 ? ` (+${hiddenCount} more)` : ''

   return `${formattedCurrencies.join(', ')}${suffix}`
}