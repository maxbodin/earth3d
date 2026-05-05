export function replaceCurrentUrl(currentUrl: URL, eventName: string, detail: unknown): void {
   const queryString = currentUrl.searchParams.toString()
   const nextRelativeUrl = `${currentUrl.pathname}${
      queryString.length > 0 ? `?${queryString}` : ''
   }${currentUrl.hash}`

   window.history.replaceState(window.history.state, '', nextRelativeUrl)

   window.dispatchEvent(
      new CustomEvent(eventName, { detail }),
   )
}