/** Beer count with the correct word form: "1 beer", "0 beers", "2 beers", etc. */
export function formatBeerCount(count: number): string {
  return `${count} ${count === 1 ? 'beer' : 'beers'}`
}

/** Short month names for compact first-brewed dates */
const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const

/** GitHub profile URL for a contributor alias */
export function githubProfileUrl(alias: string): string {
  return `https://github.com/${encodeURIComponent(alias)}`
}

/**
 * First brewed date from the API: "04/2007" → "APR 2007", "2007" → "2007".
 * Unknown formats are returned as is so no data is lost.
 */
export function formatFirstBrewed(value: string): string {
  const raw = value.trim()
  const match = /^(\d{1,2})\/(\d{4})$/.exec(raw)
  if (!match) return raw

  const month = Number(match[1])
  if (month < 1 || month > 12) return raw

  return `${MONTHS_SHORT[month - 1]} ${match[2]}`
}
