export async function fetchJsonIfOk<T>(url: string): Promise<T | null> {
   try {
      const response = await fetch(url, {
         cache: 'no-store',
      })

      if (!response.ok) {
         return null
      }

      return await response.json() as T
   } catch {
      return null
   }
}