import { create } from 'zustand'

/** Remembers "I want to hire this person" while the employer posts a new job for them. */
type HireIntent = {
  target: { id: string; name: string } | null
  setTarget: (t: { id: string; name: string } | null) => void
}

export const useHireIntent = create<HireIntent>(set => ({
  target: null,
  setTarget: target => set({ target }),
}))
