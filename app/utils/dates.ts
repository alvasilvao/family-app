export function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  if (start === end) return fmt(s)
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    const month = s.toLocaleDateString('en-GB', { month: 'short' })
    return `${s.getDate()}–${e.getDate()} ${month}`
  }
  return `${fmt(s)} – ${fmt(e)}`
}
