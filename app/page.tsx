'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthShell } from '@/components/AuthShell'
import { Header } from '@/components/Header'
import { RoleSelection } from '@/components/RoleSelection'
import { PhoneVerification } from '@/components/PhoneVerification'
import { AuthPage } from '@/components/AuthPage'
import { ProfileSetup } from '@/components/ProfileSetup'
import { UnifiedDashboard } from '@/components/UnifiedDashboard'
import { JobsBrowsing } from '@/components/JobsBrowsing'
import { Bookings } from '@/components/Bookings'
import { PostJob } from '@/components/PostJob'
import { JobDetails } from '@/components/JobDetails'
import { ApplyJob } from '@/components/ApplyJob'
import { WorkerProfile } from '@/components/WorkerProfile'
import { JobApplicants } from '@/components/JobApplicants'
import { BookingSlots } from '@/components/BookingSlots'
import { Messaging } from '@/components/Messaging'
import { Settings } from '@/components/Settings'
import { Support } from '@/components/Support'
import { Notifications } from '@/components/Notifications'
import { PaymentsEarnings } from '@/components/PaymentsEarnings'
import { BookingConfirmation } from '@/components/BookingConfirmation'
import { RatingsReviews } from '@/components/RatingsReviews'
import { Toast } from '@/components/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AdvancedSearch } from '@/components/AdvancedSearch'
import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { LandingPage } from '@/components/LandingPage'
import { PrivacyPolicy } from '@/components/PrivacyPolicy'
import { TermsOfService } from '@/components/TermsOfService'
import { UserProfile } from '@/components/UserProfile'
import { Suggestions } from '@/components/Suggestions'
import { PeopleSearch } from '@/components/PeopleSearch'
import { LiveSupportChat } from '@/components/LiveSupportChat'
import { FeedbackWidget } from '@/components/FeedbackWidget'
import { ExploreOnboarding } from '@/components/ExploreOnboarding'
import { ShopsBrowsing } from '@/components/ShopsBrowsing'
import { ShopPage } from '@/components/ShopPage'
import { ShopSetup } from '@/components/ShopSetup'

const KNOWN_PAGES = [
  'dashboard', 'jobs', 'people', 'bookings', 'post-job', 'job-details', 'apply-job',
  'worker-profile', 'job-applicants', 'booking-slots', 'messaging', 'settings',
  'support', 'notifications', 'payments', 'booking-confirmation', 'ratings-reviews',
  'advanced-search', 'profile', 'suggestions', 'privacy', 'terms',
  'shops', 'shop', 'shop-setup', 'explore-onboarding',
]

const AUTH_PAGES = ['role-select', 'phone-verification', 'auth', 'profile-setup', 'explore-onboarding', 'privacy', 'terms']

export default function Home() {
  const { currentPage, currentUser, setCurrentPage } = useAppStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentPage])

  // ── Unauthenticated ───────────────────────────────────────────────────────
  if (!currentUser) {
    // Pages guests can browse without logging in
    const GUEST_BROWSABLE = ['jobs', 'people', 'shops', 'shop']
    if (GUEST_BROWSABLE.includes(currentPage)) {
      return (
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground pb-20">
            {currentPage === 'jobs' && <JobsBrowsing />}
            {currentPage === 'people' && <PeopleSearch />}
            {currentPage === 'shops' && <ShopsBrowsing />}
            {currentPage === 'shop' && <ShopPage />}
            {/* Guest banner — prompt to sign up */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between text-sm">
              <span>Sign up free to apply or post jobs</span>
              <button
                onClick={() => setCurrentPage('auth')}
                className="bg-primary-foreground text-primary font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Join Butsó
              </button>
            </div>
          </div>
        </ThemeProvider>
      )
    }

    // Landing page — theme toggle visible but no back button, no logo (has its own)
    if (!AUTH_PAGES.includes(currentPage)) {
      return (
        <ThemeProvider>
          <LandingPage />
        </ThemeProvider>
      )
    }

    const backMap: Record<string, string> = {
      'role-select': 'splash',
      'phone-verification': 'splash',        // LandingPage handles role — skip role-select
      'profile-setup': 'phone-verification',
      'explore-onboarding': 'splash',
      'privacy': 'splash',
      'terms': 'splash',
    }

    return (
      <ThemeProvider>
        <AuthShell back={backMap[currentPage]}>
          {currentPage === 'role-select' && <RoleSelection />}
          {currentPage === 'phone-verification' && <PhoneVerification />}
          {currentPage === 'auth' && <AuthPage />}
          {currentPage === 'profile-setup' && <ProfileSetup />}
          {currentPage === 'explore-onboarding' && <ExploreOnboarding />}
          {currentPage === 'privacy' && <PrivacyPolicy />}
          {currentPage === 'terms' && <TermsOfService />}
        </AuthShell>
      </ThemeProvider>
    )
  }

  // ── Authenticated ─────────────────────────────────────────────────────────
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <Toast />
          <Header />
          <Sidebar />
          <main className="lg:ml-64">
            {currentPage === 'dashboard' && <UnifiedDashboard />}
            {currentPage === 'jobs' && <JobsBrowsing />}
            {currentPage === 'people' && <PeopleSearch />}
            {currentPage === 'bookings' && <Bookings />}
            {currentPage === 'post-job' && <PostJob />}
            {currentPage === 'job-details' && <JobDetails />}
            {currentPage === 'apply-job' && <ApplyJob />}
            {currentPage === 'worker-profile' && <WorkerProfile />}
            {currentPage === 'job-applicants' && <JobApplicants />}
            {currentPage === 'booking-slots' && <BookingSlots />}
            {currentPage === 'messaging' && <Messaging />}
            {currentPage === 'settings' && <Settings />}
            {currentPage === 'support' && <Support />}
            {currentPage === 'notifications' && <Notifications />}
            {currentPage === 'payments' && <PaymentsEarnings />}
            {currentPage === 'booking-confirmation' && <BookingConfirmation />}
            {currentPage === 'ratings-reviews' && <RatingsReviews />}
            {currentPage === 'advanced-search' && <AdvancedSearch />}
            {currentPage === 'profile' && <UserProfile />}
            {currentPage === 'suggestions' && <Suggestions />}
            {currentPage === 'privacy' && <PrivacyPolicy />}
            {currentPage === 'terms' && <TermsOfService />}
            {currentPage === 'shops' && <ShopsBrowsing />}
            {currentPage === 'shop' && <ShopPage />}
            {currentPage === 'shop-setup' && <ShopSetup />}

            {!KNOWN_PAGES.includes(currentPage) && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <p className="text-4xl mb-3">🚧</p>
                  <h1 className="text-2xl font-black text-foreground mb-2">Coming Soon</h1>
                  <p className="text-muted-foreground text-sm">This page is under development</p>
                </div>
              </div>
            )}
          </main>

          <BottomNav />
          <LiveSupportChat />
          <FeedbackWidget />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  )
}