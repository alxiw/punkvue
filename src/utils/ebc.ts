/** Color marker for the EBC scale; null if the value is unknown. Higher values are darker and less saturated. */
export function getEbcColor(ebc: string | number | null | undefined): string | null {
  if (!ebc) return null

  const value = Number(ebc)
  if (Number.isNaN(value)) return null

  return `hsl(${Math.max(18, 48 - value / 5)} 80% ${Math.max(18, 62 - value / 4)}%)`
}
