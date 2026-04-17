export function formatList(values: string[], maxItems = MAX_LIST_PREVIEW_COUNT): string {
   if (values.length === 0) {
      return N_A_VALUE
   }

   const visibleValues = values.slice(0, maxItems)
   const hiddenCount = values.length - visibleValues.length
   const suffix = hiddenCount > 0 ? ` (+${hiddenCount} more)` : ''

   return `${visibleValues.join(', ')}${suffix}`
}