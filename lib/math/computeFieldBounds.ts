export function computeFieldBounds<T>(
   items: T[],
   getter: (item: T) => number | null | undefined,
): FieldBounds | null {
   let min = Infinity
   let max = -Infinity
   for (const item of items) {
      const value = getter(item)
      if (value == null) continue
      if (value < min) min = value
      if (value > max) max = value
   }
   return min <= max ? { min, max } : null
}
