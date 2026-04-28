import { TimeRangeLabel } from '@/app/types/timeRangeLabel'
import { ONE_DAY_IN_MS, ONE_HOUR_IN_MS, ONE_MONTH_IN_MS, ONE_WEEK_IN_MS } from '@/app/constants/numbers'

export function getTimeRangeStartIso(range: TimeRangeLabel): string {
   const now = new Date()
   switch (range) {
      case 'hour':
         return new Date(now.getTime() - ONE_HOUR_IN_MS).toISOString()
      case 'day':
         return new Date(now.getTime() - ONE_DAY_IN_MS).toISOString()
      case 'week':
         return new Date(now.getTime() - ONE_WEEK_IN_MS).toISOString()
      case 'month':
         return new Date(now.getTime() - ONE_MONTH_IN_MS).toISOString()
   }
}