'use client'

// Must stay the FIRST import: it notes a password-reset link in the URL hash
// before the Supabase client reads and clears it.
import '@/lib/recovery'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isRecovery, markRecovery } from '@/lib/recovery'
import { useAppStore, type UserRole, goAfterAuth } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { refreshJobs } from '@/lib/data'
import { stopMessagesRealtime } from '@/lib/dataMessages'
import { loadUserData } from '@/lib/loadUserData'
import { refreshShops } from '@/lib/dataShops'
import { registerRouter, recordPath, navigatedRecently } from '@/lib/navigation'
import { pageFromPath, pathFromLegacySearch, isEntryPage, isGuestPage, isOpenPage } from '@/lib/routes'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toast } from '@/components/Toast'

/**
 * Wraps the whole app, once.
 *  - keeps the store's "which screen" values in step with the URL
 *  - runs the sign-in check (Google return, email link, refresh)
 *  - sends people away from screens they are not allowed to see
 *  - turns old /?p=shop&shop=abc links into the new URLs
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const currentUser = useAppStore(s => s.currentUser)
  const pendingBooking = useAppStore(s => s.pendingBooking)
  const [authChecked, setAuthChecked] = useState(false)
  const legacyDone = useRef(false)

  // Let the store (non-React code) change the URL
  useEffect(() => { registerRouter(router) }, [router])

  // URL -> store. The URL is the source of truth for which screen is showing.
  useEffect(() => {
    recordPath(pathname)
    const t = pageFromPath(pathname)
    useAppStore.setState(st => ({
      currentPage: t.page,
      selectedShopId: t.shopId ?? st.selectedShopId,
      selectedJobId: t.jobId ?? st.selectedJobId,
      viewedWorkerId: t.workerId ?? st.viewedWorkerId,
      viewedUsername: t.username ?? null,
      reviewWorkerId: t.reviewWorkerId ?? st.reviewWorkerId,
      authPanel: t.authPanel ?? st.authPanel,
    }))
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  // Jobs and shops are public, so load them for guests and signed-in users alike
  useEffect(() => { refreshJobs() }, [])
  useEffect(() => { refreshShops() }, [])

  // ── Session bridge ────────────────────────────────────────────────────────
  // Supabase is the source of truth for who is logged in.
  useEffect(() => {
    let cancelled = false
    const st = () => useAppStore.getState()

    const bridge = async (userId: string | null) => {
      if (!userId) { if (!cancelled) setAuthChecked(true); return }
      if (st().currentUser) { if (!cancelled) setAuthChecked(true); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (cancelled) return
      if (!p) {
        // Signed in but no profile yet: finish onboarding (unless they are resetting their password)
        if (!isRecovery()) st().setCurrentPage('profile-setup')
      } else {
        st().setCurrentUser({
          id: p.id,
          phone: p.phone || '',
          name: p.name,
          username: p.username,
          role: p.role as UserRole,
          bio: p.bio ?? undefined,
          gender: p.gender ?? undefined,
          skills: p.skills?.length ? p.skills : undefined,
          rating: Number(p.rating ?? 5),
          completedJobs: p.completed_jobs ?? 0,
        })
        st().setDashboardMode(p.role === 'employer' ? 'need-help' : 'find-work')
        loadUserData(p.id)
        if (isRecovery()) {
          st().setCurrentPage('reset-password')
        } else {
          // Only jump to the dashboard (or back to where they were) from the start / sign-in
          // screens. On any other URL (a refresh, a shared link) they are already in the right place.
          const here = pageFromPath(window.location.pathname).page
          if (here === 'splash' || isEntryPage(here)) goAfterAuth()
        }
      }
      setAuthChecked(true)
    }

    supabase.auth.getSession().then(({ data }) => {
      bridge(data.session?.user.id ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        markRecovery()
        st().setCurrentPage('reset-password')
      }
      if (event === 'SIGNED_IN' && session?.user) {
        // Defer: don't call supabase inside the auth callback itself
        setTimeout(() => bridge(session.user.id), 0)
      }
      if (event === 'SIGNED_OUT') {
        st().setCurrentUser(null)
        stopMessagesRealtime()
        st().setBookings([]); st().setNotifications([])
        st().setMessages([]); st().setConversations([])
      }
    })

    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

  // ── Old links: /?p=shop&shop=abc  ->  /shops/abc ───────────────────────────
  useEffect(() => {
    if (!authChecked || legacyDone.current) return
    legacyDone.current = true
    if (window.location.pathname !== '/') return
    const target = pathFromLegacySearch(window.location.search)
    if (target) router.replace(target)
  }, [authChecked, router])

  // ── Who may see what ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!authChecked) return
    const t = pageFromPath(pathname)
    if (t.page === 'not-found' || isOpenPage(t.page)) return
    if (navigatedRecently()) return // a move is already on its way (e.g. right after login or logout)

    if (!currentUser) {
      // Signed out: browsing is fine, everything else goes back to the landing page
      if (t.page !== 'splash' && !isGuestPage(t.page) && !isEntryPage(t.page)) router.replace('/')
      return
    }
    // Signed in: the landing and sign-in screens are no use any more
    if (t.page === 'splash' || isEntryPage(t.page)) { router.replace('/dashboard'); return }
    // These only make sense in the middle of a flow
    if (t.page === 'booking-slots' && !pendingBooking) router.replace('/bookings')
  }, [authChecked, pathname, currentUser, pendingBooking, router])

  if (!authChecked && !currentUser) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Toast />
      {children}
    </ThemeProvider>
  )
}

