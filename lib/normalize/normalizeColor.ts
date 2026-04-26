const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/
const HEX_0X_COLOR_PATTERN = /^0x[0-9a-fA-F]{6}$/

export const normalizeColor = (value: string): string | null => {
   if (HEX_COLOR_PATTERN.test(value)) return value
   if (HEX_0X_COLOR_PATTERN.test(value)) return `#${value.slice(2)}`
   return null
}