import { differenceInCalendarDays, eachDayOfInterval, isWeekend, parseISO } from 'date-fns'

/**
 * Count working days between two dates (excludes weekends)
 */
export function countWorkingDays(startDate: string, endDate: string): number {
  const start = parseISO(startDate)
  const end = parseISO(endDate)

  if (start > end) return 0

  const days = eachDayOfInterval({ start, end })
  return days.filter((day) => !isWeekend(day)).length
}

/**
 * Format date to display string
 */
export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr)
  return date.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format date range
 */
export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
