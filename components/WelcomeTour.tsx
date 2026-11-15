'use client'

// Shows the welcome tour once to every signed-in member: new people after onboarding, and
// existing members on their next visit. Skipping counts as seen. It can be replayed any time
// from Help & Support or Settings (useTourStore().openTour()).
//
// It waits politely: never on sign-in or setup screens, never before the age / Terms check
// has passed, and never on top of another pop-up (a celebration, a confirm dialog...).
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { useLegalStatus } from '@/lib/legalStatus'
import { hasSeenTour, markTourSeen, useTourStore } from '@/lib/tour'
import { WELCOME_TOUR } from '@/lib/guideContent'

const StepGuide = dynamic(() => import('@/components/StepGuide'), { ssr: false })

// Main screens only. Not sign-in, setup, password reset, or the middle of a booking.
const TOUR_PAGES = new Set([
  'dashboard', 'jobs', 'job-details', 'shops', 'shop', 'people', 'worker-username',
  'bookings', 'messaging', 'notifications', 'profile', 'settings', 'payments',
])

const FIRST_WAIT_MS = 1200 // let the screen settle first
const RETRY_MS = 1500      // another pop-up is open: look again shortly

const anotherDialogOpen = () => !!document.querySelector('[role="dialog"], [role="alertdialog"]')

export function WelcomeTour() {
  const userId = useAppStore(s => s.currentUser?.id)
  const page = useAppStore(s => s.currentPage)
  const legal = useLegalStatus(s => s.status)
  const replay = useTourStore(s => s.replay)
  const [open, setOpen] = useState(false)
  const decided = useRef<string | null>(null) // the user we already decided for, this visit

  const isMember = !!userId && !userId.startsWith('guest-')
  const eligible = isMember && legal === 'ok' && TOUR_PAGES.has(page)

  // First time: open automatically
  useEffect(() => {
    if (!eligible || !userId || open || decided.current === userId) return
    let alive = true
    let timer: ReturnType<typeof setTimeout> | undefined
    hasSeenTour(userId).then(seen => {
      if (!alive) return
      if (seen) { decided.current = userId; return }
      const tryOpen = () => {
        if (!alive) return
        if (anotherDialogOpen()) { timer = setTimeout(tryOpen, RETRY_MS); return }
        decided.current = userId
        setOpen(true)
      }
      timer = setTimeout(tryOpen, FIRST_WAIT_MS)
    })
    return () => { alive = false; if (timer) clearTimeout(timer) }
  }, [eligible, userId, open])

  // Replay on request
  useEffect(() => { if (replay > 0) setOpen(true) }, [replay])

  const close = (how: 'done' | 'skipped') => {
    setOpen(false)
    if (userId && isMember) markTourSeen(userId, how)
  }

  return (
    <AnimatePresence>
      {open && <StepGuide key="welcome-tour" guide={WELCOME_TOUR} variant="tour" autoPlay onClose={close} />}
    </AnimatePresence>
  )
}
