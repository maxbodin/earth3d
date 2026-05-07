export function getCurrentUrl(): URL | null {
   if (typeof window === 'undefined') return null
   return new URL(window.location.href)
}