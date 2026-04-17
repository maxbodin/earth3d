export type CountryProfileSeed = {
   countryName: string
   alpha2: string
   alpha3: string
   numericCode: number | null
   latitude: number | null
   longitude: number | null
}

export type CountryCurrency = {
   code: string | null
   name: string | null
   symbol: string | null
}

export type CountryLanguage = {
   iso639_1: string | null
   iso639_2: string | null
   name: string | null
   nativeName: string | null
}

export type CountryRegionalBloc = {
   acronym: string | null
   name: string | null
}

export type CountryWorldometerSnapshot = {
   source: 'worldometers-via-disease-sh'
   updatedAt: number | null
   continent: string | null
   population: number | null
   cases: number | null
   todayCases: number | null
   deaths: number | null
   todayDeaths: number | null
   recovered: number | null
   todayRecovered: number | null
   active: number | null
   critical: number | null
   tests: number | null
   casesPerOneMillion: number | null
   deathsPerOneMillion: number | null
   testsPerOneMillion: number | null
}

export type CountryProfile = {
   summary: {
      name: string
      nativeName: string | null
      alpha2: string
      alpha3: string
      numericCode: string | null
      demonym: string | null
      independent: boolean | null
      cioc: string | null
      flagPngUrl: string | null
      flagSvgUrl: string | null
   }
   geography: {
      capital: string | null
      region: string | null
      subregion: string | null
      latitude: number | null
      longitude: number | null
      areaKm2: number | null
      timezones: string[]
      borders: string[]
      topLevelDomains: string[]
   }
   demographics: {
      population: number | null
      gini: number | null
      callingCodes: string[]
      altSpellings: string[]
   }
   economy: {
      currencies: CountryCurrency[]
   }
   culture: {
      languages: CountryLanguage[]
      translations: Record<string, string>
      regionalBlocs: CountryRegionalBloc[]
   }
   worldometer: CountryWorldometerSnapshot | null
   meta: {
      hasApiCountries: boolean
      hasWorldometer: boolean
      fetchedAtIso: string
   }
}

export type ApiCountriesCountryResponse = {
   name?: unknown
   topLevelDomain?: unknown
   alpha2Code?: unknown
   alpha3Code?: unknown
   callingCodes?: unknown
   capital?: unknown
   altSpellings?: unknown
   subregion?: unknown
   region?: unknown
   population?: unknown
   latlng?: unknown
   demonym?: unknown
   area?: unknown
   gini?: unknown
   timezones?: unknown
   borders?: unknown
   nativeName?: unknown
   numericCode?: unknown
   flags?: unknown
   currencies?: unknown
   languages?: unknown
   translations?: unknown
   regionalBlocs?: unknown
   cioc?: unknown
   independent?: unknown
}

export type WorldometerCountryResponse = {
   updated?: unknown
   continent?: unknown
   population?: unknown
   cases?: unknown
   todayCases?: unknown
   deaths?: unknown
   todayDeaths?: unknown
   recovered?: unknown
   todayRecovered?: unknown
   active?: unknown
   critical?: unknown
   tests?: unknown
   casesPerOneMillion?: unknown
   deathsPerOneMillion?: unknown
   testsPerOneMillion?: unknown
}
