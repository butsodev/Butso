'use client'

import { ChevronRight, Home } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const PAGE_TITLES: Record<string, string> = {
  'dashboard': 'Dashboard',
  'jobs': 'Browse Jobs',
  'bookings': 'My Bookings',
  'messaging': 'Messages',
  'notifications': 'Notifications',
  'settings': 'Settings',
  'support': 'Help & Support',
  'payments': 'Payments & Earnings',
  'job-details': 'Job Details',
  'apply-job': 'Apply for Job',
  'post-job': 'Post a Job',
  'worker-profile': 'Worker Profile',
  'job-applicants': 'View Applicants',
  'booking-slots': 'Select Booking Slots',
  'booking-confirmation': 'Booking Confirmation',
  'ratings-reviews': 'Leave a Review',
  'advanced-search': 'Search Workers',
}

export function Breadcrumbs() {
  const { currentPage, pageHistory, setCurrentPage } = useAppStore()
  
  // Build breadcrumb path
  const getBreadcrumbs = () => {
    const crumbs = []
    
    // Always start with dashboard
    crumbs.push({ page: 'dashboard', title: 'Home' })
    
    // Add history items (skip first page which is always in history)
    for (const page of pageHistory) {
      if (page && page !== 'dashboard') {
        crumbs.push({ page, title: PAGE_TITLES[page] || page })
      }
    }
    
    // Add current page
    if (currentPage !== 'dashboard') {
      crumbs.push({ page: currentPage, title: PAGE_TITLES[currentPage] || currentPage })
    }
    
    return crumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  // Don't show breadcrumbs if on dashboard or single page
  if (breadcrumbs.length <= 1) return null
  
  return (
    <nav className="bg-card border-b border-border px-4 sm:px-6 py-3">
      <div className="flex items-center gap-2 text-sm overflow-x-auto">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.page} className="flex items-center gap-2 whitespace-nowrap">
            {index === 0 ? (
              <button
                onClick={() => setCurrentPage(crumb.page)}
                className="flex items-center gap-1 text-foreground hover:text-primary transition"
              >
                <Home size={16} />
              </button>
            ) : (
              <>
                <ChevronRight size={16} className="text-muted-foreground" />
                <button
                  onClick={() => setCurrentPage(crumb.page)}
                  className="text-foreground hover:text-primary transition"
                >
                  {crumb.title}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
