// Whether the age / Terms check (components/LegalGate) has finished for the signed-in person.
// Other pop-ups that should never sit underneath it (like the welcome tour) wait for 'ok'.
import { create } from 'zustand'

export type LegalStatus = 'unknown' | 'ok' | 'blocked'

export const useLegalStatus = create<{ status: LegalStatus; set: (s: LegalStatus) => void }>(set => ({
  status: 'unknown',
  set: status => set({ status }),
}))
