// The welcome tour is shown once per account. "Once" is remembered in two places:
//  - this browser (localStorage), so it is instant and works offline
//  - the account itself (Supabase auth user_metadata), so a new phone does not show it again
// No database table or migration is needed: user_metadata is the signed-in user's own
// data, which Supabase lets them update.
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

/** Bump after a big change to WELCOME_TOUR, and everyone sees the new tour once. */
export const TOUR_VERSION = 1

const META_KEY = 'welcome_tour_seen'
const storageKey = (userId: string) => `butso:welcome-tour:v${TOUR_VERSION}:${userId}`

function seenHere(userId: string): boolean {
  try { return localStorage.getItem(storageKey(userId)) !== null } catch { return false }
}

/** True if this person has finished or skipped the current tour, on any device. */
export async function hasSeenTour(userId: string): Promise<boolean> {
  if (seenHere(userId)) return true
  try {
    // getSession reads the cached session: no network request
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    if (user?.id !== userId) return false
    const seen = Number(user.user_metadata?.[META_KEY] ?? 0)
    if (seen >= TOUR_VERSION) {
      try { localStorage.setItem(storageKey(userId), 'account') } catch { /* private mode */ }
      return true
    }
  } catch { /* if we cannot tell, fall through and show it: it is skippable */ }
  return false
}

/** Remember the tour as seen. Skipping counts: the person said no, so do not ask again. */
export function markTourSeen(userId: string, how: 'done' | 'skipped') {
  try { localStorage.setItem(storageKey(userId), how) } catch { /* private mode */ }
  // Best effort: if this fails, this device still remembers
  void supabase.auth.updateUser({ data: { [META_KEY]: TOUR_VERSION } }).then(() => {}, () => {})
}

/** Lets any screen (Help & Support, Settings) replay the tour. */
export const useTourStore = create<{ replay: number; openTour: () => void }>(set => ({
  replay: 0,
  openTour: () => set(s => ({ replay: s.replay + 1 })),
}))
