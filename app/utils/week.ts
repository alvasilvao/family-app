export function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return {
    week: Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7),
    year: d.getUTCFullYear(),
  }
}

export function getWeekDates(week: number, year: number) {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() || 7) - 1))
  const monday = new Date(startOfWeek1)
  monday.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return { monday, sunday, label: `${fmt(monday)} – ${fmt(sunday)}` }
}

export function currentWeekKey(): string {
  const { week, year } = getISOWeek(new Date())
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function nextWeekKey(): string {
  const now = new Date()
  const next = new Date(now)
  next.setDate(now.getDate() + 7)
  const { week, year } = getISOWeek(next)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function parseWeekKey(key: string): { year: number; week: number } {
  const [year, w] = key.split('-W')
  return { year: parseInt(year), week: parseInt(w) }
}

export function weekKeyLabel(key: string): string {
  const { year, week } = parseWeekKey(key)
  return getWeekDates(week, year).label
}

export function adjacentWeek(key: string, delta: number): string {
  const { year, week } = parseWeekKey(key)
  const { monday } = getWeekDates(week, year)
  monday.setUTCDate(monday.getUTCDate() + delta * 7)
  const nw = getISOWeek(monday)
  return `${nw.year}-W${String(nw.week).padStart(2, '0')}`
}

/** Convert UUID string to a stable integer for deterministic hashing (djb2) */
export function hashId(uuid: string): number {
  let hash = 5381
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) + hash + uuid.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}
