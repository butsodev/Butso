'use client'

import { useAppStore } from '@/lib/store'
import { Header } from '@/components/Header'
import { SplashScreen } from '@/components/SplashScreen'
import { RoleSelection } from '@/components/RoleSelection'
import { PhoneVerification } from '@/components/PhoneVerification'
import { ProfileSetup } from '@/components/ProfileSetup'
import { WorkerDashboard } from '@/components/WorkerDashboard'
import { EmployerDashboard } from '@/components/EmployerDashboard'
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
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Sidebar } from '@/components/Sidebar'

export default function Home() {
  const { currentPage, currentUser } = useAppStore()

  // Render splash and onboarding screens without header
  if (!currentUser) {
    switch (currentPage) {
      case 'splash':
        return <SplashScreen />
      case 'role-select':
        return <RoleSelection />
      case 'phone-verification':
        return <PhoneVerification />
      case 'profile-setup':
        return <ProfileSetup />
      default:
        return <SplashScreen />
    }
  }

  // Render authenticated pages with header
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Toast />
        <Header />
        <Sidebar />
        <Breadcrumbs />
        <main className="lg:ml-64">
        {currentPage === 'dashboard' &&
          (currentUser.role === 'worker' ? (
            <WorkerDashboard />
          ) : (
            <EmployerDashboard />
          ))}
        
        {currentPage === 'jobs' && <JobsBrowsing />}
        
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
        
        {/* Fallback for unknown pages */}
        {currentPage !== 'dashboard' &&
          currentPage !== 'jobs' &&
          currentPage !== 'bookings' &&
          currentPage !== 'post-job' &&
          currentPage !== 'job-details' &&
          currentPage !== 'apply-job' &&
          currentPage !== 'worker-profile' &&
          currentPage !== 'job-applicants' &&
          currentPage !== 'booking-slots' &&
          currentPage !== 'messaging' &&
          currentPage !== 'settings' &&
          currentPage !== 'support' &&
          currentPage !== 'notifications' &&
          currentPage !== 'payments' &&
          currentPage !== 'booking-confirmation' &&
          currentPage !== 'ratings-reviews' &&
          currentPage !== 'advanced-search' && (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Page Coming Soon
                </h1>
                <p className="text-muted-foreground">
                  This page is under development
                </p>
              </div>
            </div>
          )}
      </main>
      </div>
    </ErrorBoundary>
  )
}
