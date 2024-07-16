/**
 * Get the displayed emoji for a continent string.
 * @param continent
 */
export const getContinentEmoji = (continent: string): string => {
   switch (continent) {
      case 'EU':
         return '🇪🇺'
      case 'AF':
         return '🌍🦒'
      case 'NA':
         return '🌎🗽'
      case 'OC':
         return '🌏🐨'
      case 'SA':
         return '🌎🌵'
      case 'AS':
         return '🌏🐼'
      default:
         return continent
   }
}

/**
 * Get the displayed string for a continent string.
 * @param continent
 */
export const getContinentString = (continent: string): string => {
   switch (continent) {
      case 'EU':
         return 'Europe'
      case 'AF':
         return 'Africa'
      case 'NA':
         return 'North America'
      case 'AN':
         return 'Antarctica'
      case 'SA':
         return 'South America'
      case 'AS':
         return 'Asia'
      case 'OC':
         return 'Oceania'
      default:
         return continent
   }
}

/**
 * Get the displayed string for an airport type.
 * @param type
 */
export const getTypeString = (type: string): string => {
   switch (type) {
      case 'small_airport':
         return 'Small Airport 🕹️'
      case 'medium_airport':
         return 'Medium Airport 🛩'
      case 'large_airport':
         return 'Large Airport ✈️'
      case 'heliport':
         return 'Heliport 🚁'
      case 'closed':
         return 'CLOSED ❌'
      case 'seaplane_base':
         return 'Seaplane Base 🛟'
      case 'balloonport':
         return 'Balloon port 🎈'
      default:
         return type
   }
}
