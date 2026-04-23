import { expect, test } from '@playwright/test'
import { formatList } from '@/lib/format/formatList'

test.describe('formatList', () => {
   test('returns the empty fallback and truncates long lists with a suffix', () => {
      expect(formatList([])).toBe('N/A')
      expect(formatList(['One', 'Two', 'Three', 'Four', 'Five', 'Six'])).toBe(
         'One, Two, Three, Four, Five, Six',
      )
      expect(formatList(['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'])).toBe(
         'One, Two, Three, Four, Five, Six (+1 more)',
      )
   })
})