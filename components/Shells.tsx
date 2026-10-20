'use client'

import { usePathname } from 'next/navigation'
import { useAppStore, rememberReturnTo } from '@/lib/store'
import { pageFromPath, isGuestPage } from '@/lib/routes'
import { AuthShell } from '@/components/AuthShell'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { LiveSupportChat } from '@/components/LiveSupportChat'
import { FeedbackWidget } from '@/components/FeedbackWidget'

/** Signed-in frame: header, sidebar, bottom navigation. */
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />
        <main className="lg:ml-64">{children}</main>
        <BottomNav />
        <LiveSupportChat />
        <FeedbackWidget />
      </div>
    </ErrorBoundary>
  )
}

/** Signed-out visitors browsing: plain page with a sign-up banner at the bottom. */
function GuestShell({ children }: { children: React.ReactNode }) {
  const openAuth = useAppStore(s => s.openAuth)
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {children}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between text-sm">
        <span>Sign up free to apply or post jobs</span>
        <button
          onClick={() => { rememberReturnTo(); openAuth('signup') }}
          className="bg-primary-foreground text-primary font-bold px-4 min-h-[44px] rounded-lg text-xs"
        >
          Join Butsó
        </button>
      </div>
    </div>
  )
}

/**
 * Frame for every screen that can be signed in or out: it picks the right one.
 * Reads the page from the URL itself so the first paint is already correct.
 */
export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const page = pageFromPath(pathname).page
  const currentUser = useAppStore(s => s.currentUser)

  if (currentUser) return <AppShell>{children}</AppShell>
  if (page === 'privacy' || page === 'terms') return <AuthShell back="splash">{children}</AuthShell>
  if (isGuestPage(page)) return <GuestShell>{children}</GuestShell>
  return null // the guard in AuthGate is sending them to the landing page
}

const BACK: Record<string, string> = {
  'role-select': 'splash',
  'phone-verification': 'splash',
  'profile-setup': 'splash',
  'forgot-password': 'auth',
  'explore-onboarding': 'splash',
}

/** Frame for sign-in and onboarding screens. */
export function EntryShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const page = pageFromPath(pathname).page
  return <AuthShell back={BACK[page]}>{children}</AuthShell>
}
