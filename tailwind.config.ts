import type { Config } from 'tailwindcss'
import { nextui } from '@nextui-org/react'

const config: Config = {
   content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './shadcn/**/*.{js,ts,jsx,tsx}',
      './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
   ],
   darkMode: 'class',
   theme: {
      extend: {
         keyframes: {
            'loading-spin': {
               from: { transform: 'rotate(0deg)' },
               to: { transform: 'rotate(360deg)' },
            },
            'fade-in': {
               from: { opacity: '0' },
               to: { opacity: '1' },
            },
            'fade-out': {
               from: { opacity: '1' },
               to: { opacity: '0' },
            },
         },
         animation: {
            'loading-spin': 'loading-spin 2.5s linear infinite',
            'fade-in': 'fade-in 0.15s ease-in forwards',
            'fade-out': 'fade-out 1.2s ease-out forwards',
         },
      },
   },
   plugins: [nextui()],
}
export default config
