// Wukari areas — single source of truth used across ProfileSetup, PostJob, search filters
export const WUKARI_AREAS = [
  'Abuja Area',
  'Central Wukari',
  'North Wukari',
  'South Wukari',
  'GRA',
  'Downstream',
  'Rafin Kada',
  'Chancery',
  'Avena',
  'Magajin Gari',
  'Puje',
  'Kente',
] as const

export type WukariArea = typeof WUKARI_AREAS[number]

// Proximity label shown on worker/job cards relative to a viewer's area
export function proximityLabel(viewerArea: string | null | undefined, targetArea: string | null | undefined): string | null {
  if (!viewerArea || !targetArea) return null
  if (viewerArea === targetArea) return 'Same area'
  // Both are in Wukari — close enough to be "Nearby"
  if (WUKARI_AREAS.includes(viewerArea as WukariArea) && WUKARI_AREAS.includes(targetArea as WukariArea)) return 'Nearby'
  return null
}
