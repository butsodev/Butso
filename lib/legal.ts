// Legal basics shared by signup, settings and the Terms / Privacy pages.
// Bump LEGAL_VERSION whenever the Terms or Privacy Policy change in a way that matters.
// It is saved with each person's consent so you can show which version they agreed to.
export const LEGAL_VERSION = '2026-11-01'
export const ADULT_AGE = 18

/** Whole years between a YYYY-MM-DD birth date and today. Returns null if the date is invalid. */
export function ageFromBirthDate(birthDate: string, today = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  if (!m) return null
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3])
  const born = new Date(y, mo - 1, d)
  if (born.getFullYear() !== y || born.getMonth() !== mo - 1 || born.getDate() !== d) return null
  if (born > today) return null
  let age = today.getFullYear() - y
  const hadBirthday = today.getMonth() > mo - 1 || (today.getMonth() === mo - 1 && today.getDate() >= d)
  if (!hadBirthday) age -= 1
  return age
}

/** Latest date someone can be born on and still be an adult today (for the date picker's max). */
export function latestAdultBirthDate(today = new Date()): string {
  const d = new Date(today.getFullYear() - ADULT_AGE, today.getMonth(), today.getDate())
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
