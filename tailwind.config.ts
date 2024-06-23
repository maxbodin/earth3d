import type { Config } from 'tailwindcss'
import { nextui } from '@nextui-org/react'

const config: Config = {
   content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
   ],
   darkMode: 'class',
   plugins: [nextui()],
}
export default config
