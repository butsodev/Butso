'use client'

import { motion } from 'framer-motion'
import { Home, Search, Store, MessageCircle, User } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'jobs', icon: Search, label: 'Jobs' },
  { id: 'shops', icon: Store, label: 'Shops' },
  { id: 'messaging', icon: MessageCircle, label: 'Messages' },
  { id: 'profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const { currentUser, setCurrentPage, currentPage } = useAppStore()

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
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="flex flex-col items-center gap-0.5 p-2 flex-1 rounded-xl transition group"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : 'group-hover:bg-secondary'}`}>
                <Icon
                  size={22}
                  className={`transition ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                />
              </div>
              <span className={`text-[10px] font-semibold transition ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </motion.nav>
  )
}