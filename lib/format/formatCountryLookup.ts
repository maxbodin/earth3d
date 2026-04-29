import { N_A_VALUE } from '@/app/constants/strings'

const lookup = require('country-data').lookup

export function resolveCountryNameByAlpha2(alpha2: string): string {
   return lookup?.countries({ alpha2 })[0]?.name ?? N_A_VALUE
}

export function resolveCountryEmojiByAlpha2(alpha2: string): string {
   return lookup?.countries({ alpha2 })[0]?.emoji ?? ''
}

export function resolveCountryEmojiByName(name: string): string {
   return lookup?.countries({ name })[0]?.emoji ?? ''
}
