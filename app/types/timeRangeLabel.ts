export type TimeRangeLabel = 'hour' | 'day' | 'week' | 'month'

export const TIME_RANGE_OPTIONS: { value: TimeRangeLabel; label: string }[] = [
   { value: 'hour', label: 'Last Hour' },
   { value: 'day', label: 'Last 24h' },
   { value: 'week', label: 'Last Week' },
   { value: 'month', label: 'Last Month' },
]