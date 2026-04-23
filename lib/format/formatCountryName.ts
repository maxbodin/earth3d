export function formatCountryName(countryName: string): string {
   return countryName
      .replace(/ /g, '_')
      .replace(/\./g, '')
      .replace(/&/g, 'and')
      .toLowerCase()
}