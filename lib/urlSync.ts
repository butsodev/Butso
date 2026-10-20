'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * Keeps the address bar in step with the screen the app is showing, so that:
 *  - the phone / browser Back button moves between screens instead of leaving the app
 *  - a copied link (e.g. ?p=shop&shop=abc) opens the same screen
 *  - refreshing keeps you where you were
 *
 * The app still switches screens with `currentPage` in the store. This file only mirrors
 * that value into the URL and reads it back. Moving to real Next.js routes comes later.
 */

// Pages a signed-out visitor may open
const GUEST_PAGES = ['jobs', 'people', 'shops', 'shop', 'privacy', 'terms', 'forgot-password', 'reset-password']
// Pages that belong to signing in / signing up (not useful once signed in)
const ENTRY_PAGES = ['splash', 'role-select', 'phone-verification', 'auth', 'profile-setup', 'explore-onboarding', 'forgot-password']
// Pages that only make sense mid-flow. They need data that a link can't carry
const FLOW_ONLY: Record<string, string> = {
  'booking-slots': 'bookings',
  'booking-confirmation': 'bookings',
}
// Pages that need an id in the URL
const NEEDS_JOB = ['job-details', 'apply-job', 'job-applicants']

/** How many in-app screens deep this history entry is (0 = first screen of this visit) */
function depth(): number {
  const i = window.history.state?.idx
  return typeof i === 'number' ? i : 0
}

export type Target = { page: string; shopId: string | null; jobId: string | null; workerId: string | null }

/** Build the URL query string for the current screen. Landing page = clean "/" */
export function toSearch(page: string, shopId: string | null, jobId: string | null, workerId: string | null = null): string {
  if (!page || page === 'splash') return ''
  const q = new URLSearchParams({ p: page })
  if (page === 'shop' && shopId) q.set('shop', shopId)
  if (NEEDS_JOB.includes(page) && jobId) q.set('job', jobId)
  if (page === 'ratings-reviews' && workerId) q.set('worker', workerId)
  return '?' + q.toString()
}

/** Read the screen out of the URL. */
export function fromSearch(search: string): Target {
  const q = new URLSearchParams(search)
  return { page: q.get('p') || 'splash', shopId: q.get('shop'), jobId: q.get('job'), workerId: q.get('worker') }
}

/**
 * Decide what we are actually allowed to show for a requested target.
 * `known` is the list of screens the app can render.
 */
export function resolveTarget(t: Target, signedIn: boolean, known: string[], hasPendingBooking: boolean): Target {
  let { page } = t
  const { shopId, jobId, workerId } = t

  if (page !== 'splash' && !known.includes(page) && !ENTRY_PAGES.includes(page)) page = 'splash'

  if (!signedIn) {
    // Signed out: guests can browse, everything else goes to the landing page
    if (!GUEST_PAGES.includes(page) && !ENTRY_PAGES.includes(page)) page = 'splash'
    if (page === 'shop' && !shopId) page = 'shops'
    return { page, shopId, jobId, workerId }
  }

  // Signed in: skip the sign-in screens, send people to their dashboard
  if (ENTRY_PAGES.includes(page)) page = 'dashboard'
  if (page in FLOW_ONLY && !hasPendingBooking) page = FLOW_ONLY[page]
  if (NEEDS_JOB.includes(page) && !jobId) page = 'jobs'
  if (page === 'ratings-reviews' && !workerId) page = 'people'
  if (page === 'shop' && !shopId) page = 'shops'
  return { page, shopId, jobId, workerId }
}

/**
 * Mount once in app/page.tsx.
 * `known`      – the screens the app can render (KNOWN_PAGES)
 * `ready`      – true after the first sign-in check has finished
 */
export function useUrlSync(known: string[], ready: boolean) {
  const currentPage = useAppStore(s => s.currentPage)
  const selectedShopId = useAppStore(s => s.selectedShopId)
  const selectedJobId = useAppStore(s => s.selectedJobId)
  const reviewWorkerId = useAppStore(s => s.reviewWorkerId)
  const currentUser = useAppStore(s => s.currentUser)

  // What the link asked for when the app loaded (read once, before anything changes it)
  const initialTarget = useRef<Target | null>(null)
  if (initialTarget.current === null && typeof window !== 'undefined') {
    initialTarget.current = fromSearch(window.location.search)
  }

  const appliedInitial = useRef(false)
  const lastSearch = useRef<string | null>(null)

  const apply = (t: Target) => {
    const st = useAppStore.getState()
    const r = resolveTarget(t, !!st.currentUser, known, !!st.pendingBooking)
    // setState directly: this must not add to the in-app page history
    useAppStore.setState({
      currentPage: r.page,
      selectedShopId: r.shopId ?? st.selectedShopId,
      selectedJobId: r.jobId ?? st.selectedJobId,
      reviewWorkerId: r.workerId ?? st.reviewWorkerId,
    })
    return r
  }

  // 1. Open the screen the link asked for, once the sign-in check has finished
  useEffect(() => {
    if (!ready || appliedInitial.current) return
    appliedInitial.current = true
    const t = initialTarget.current!
    const state = useAppStore.getState()
    // Signed-in users: the bridge already chose a page. Only override it for real deep links.
    if (t.page === 'splash' && state.currentUser) return
    // Signed in with Supabase but no profile yet: the bridge sent them to finish onboarding. Leave it.
    if (!state.currentUser && state.currentPage !== 'splash') return
    const r = apply(t)
    window.history.replaceState({ butso: true, idx: depth() }, '', toSearch(r.page, r.shopId, r.jobId, r.workerId) || window.location.pathname)
    lastSearch.current = toSearch(r.page, r.shopId, r.jobId, r.workerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // 2. Whenever the screen changes inside the app, add a history entry
  useEffect(() => {
    if (!ready || !appliedInitial.current) return
    // Not allowed to show this screen (e.g. signed out on a signed-in page): fall back quietly
    const r = resolveTarget(
      { page: currentPage, shopId: selectedShopId, jobId: selectedJobId, workerId: reviewWorkerId },
      !!currentUser, known, !!useAppStore.getState().pendingBooking,
    )
    if (r.page !== currentPage) {
      useAppStore.setState({ currentPage: r.page })
      return
    }
    const search = toSearch(currentPage, selectedShopId, selectedJobId, reviewWorkerId)
    if (search === lastSearch.current) return
    const url = search || window.location.pathname
    if (lastSearch.current === null) window.history.replaceState({ butso: true, idx: depth() }, '', url)
    else window.history.pushState({ butso: true, idx: depth() + 1 }, '', url)
    lastSearch.current = search
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, currentPage, selectedShopId, selectedJobId, reviewWorkerId, currentUser])

  // 3. Back / Forward buttons: read the URL and show that screen
  useEffect(() => {
    const onPop = () => {
      const r = apply(fromSearch(window.location.search))
      lastSearch.current = toSearch(r.page, r.shopId, r.jobId, r.workerId)
      // If we had to redirect (e.g. back onto a sign-in screen while signed in), fix the URL too
      if (lastSearch.current !== window.location.search) {
        window.history.replaceState({ butso: true, idx: depth() }, '', lastSearch.current || window.location.pathname)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

}
