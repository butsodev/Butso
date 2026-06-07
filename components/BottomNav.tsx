'use client'

import { motion } from 'framer-motion'
import { Home, Briefcase, Calendar, MessageCircle, User } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function BottomNav() {
  const { currentUser, setCurrentPage, currentPage } = useAppStore()

  if (!currentUser) return null

  const navItems = currentUser.role === 'worker' 
    ? [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'jobs', icon: Briefcase, label: 'Jobs' },
        { id: 'bookings', icon: Calendar, label: 'Bookings' },
        { id: 'messaging', icon: MessageCircle, label: 'Messages' },
        { id: 'profile', icon: User, label: 'Profile' },
      ]
    : [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'post-job', icon: Briefcase, label: 'Post Job' },
        { id: 'job-applicants', icon: Calendar, label: 'Applicants' },
        { id: 'messaging', icon: MessageCircle, label: 'Messages' },
        { id: 'profile', icon: User, label: 'Profile' },
      ]

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border lg:hidden z-50"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <motion.button
              key={item.id}
              whileHap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(item.id)}
              className="flex flex-col items-center gap-1 p-2 flex-1 rounded-lg transition"
            >
              <Icon
                size={24}
                className={`transition ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs font-medium transition ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}
