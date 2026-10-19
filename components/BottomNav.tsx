'use client'

import { motion } from 'framer-motion'
import { Home, Search, Store, MessageCircle, User } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { unreadCountFor } from '@/lib/dataMessages'

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'jobs', icon: Search, label: 'Jobs' },
  { id: 'shops', icon: Store, label: 'Explore' },
  { id: 'messaging', icon: MessageCircle, label: 'Messages' },
  { id: 'profile', icon: User, label: 'Profile' },
]

// Pages that count as "active" for each nav item
const activeMap: Record<string, string[]> = {
  dashboard: ['dashboard', 'bookings', 'post-job', 'job-applicants', 'payments', 'suggestions'],
  jobs: ['jobs', 'job-details', 'apply-job', 'advanced-search'],
  shops: ['shops', 'shop', 'shop-setup', 'people', 'worker-profile', 'booking-slots', 'booking-confirmation', 'ratings-reviews'],
  messaging: ['messaging'],
  profile: ['profile', 'settings', 'notifications', 'support', 'privacy', 'terms'],
}

export function BottomNav() {
  const { currentUser, setCurrentPage, currentPage, messages } = useAppStore()
  const unreadMsgs = currentUser ? unreadCountFor(messages, currentUser.id) : 0

  if (!currentUser) return null

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden z-50"
    >
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = (activeMap[item.id] ?? [item.id]).includes(currentPage)

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center gap-0.5 p-2 flex-1 min-h-[44px] rounded-xl transition group"
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : 'group-hover:bg-secondary'}`}>
                <Icon
                  size={22}
                  className={`transition ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                />
                {item.id === 'messaging' && unreadMsgs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-accent text-accent-foreground text-[10px] font-black rounded-full flex items-center justify-center">
                    {unreadMsgs > 9 ? '9+' : unreadMsgs}
                  </span>
                )}
              </div>
              <span className={`text-xs font-semibold transition ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </motion.nav>
  )
}