'use client'

import { useAppStore } from '@/lib/store'
import { signOutUser } from '@/lib/auth'
import { Home, Briefcase, Zap, MessageSquare, Calendar, HelpCircle, Settings as SettingsIcon, LogOut, Store, Compass } from 'lucide-react'
import { NairaIcon } from '@/components/NairaIcon'

interface NavItem {
  page: string
  label: string
  icon: React.ReactNode
  roles?: ('worker' | 'employer')[]
}

export function Sidebar() {
  const { currentUser, currentPage, setCurrentPage } = useAppStore()

  const workerNav: NavItem[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, roles: ['worker'] },
    { page: 'jobs', label: 'Browse Jobs', icon: <Briefcase size={20} />, roles: ['worker'] },
    { page: 'shops', label: 'Explore', icon: <Compass size={20} /> },
    { page: 'shop-setup', label: 'My Shop', icon: <Store size={20} /> },
    { page: 'bookings', label: 'My Bookings', icon: <Calendar size={20} />, roles: ['worker'] },
    { page: 'payments', label: 'Earnings', icon: <NairaIcon size={20} />, roles: ['worker'] },
    { page: 'messaging', label: 'Messages', icon: <MessageSquare size={20} /> },
    { page: 'support', label: 'Help', icon: <HelpCircle size={20} /> },
    { page: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ]

  const employerNav: NavItem[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, roles: ['employer'] },
    { page: 'post-job', label: 'Post Job', icon: <Zap size={20} />, roles: ['employer'] },
    { page: 'shops', label: 'Explore', icon: <Compass size={20} /> },
    { page: 'shop-setup', label: 'My Shop', icon: <Store size={20} /> },
    { page: 'bookings', label: 'Bookings', icon: <Calendar size={20} />, roles: ['employer'] },
    { page: 'payments', label: 'Payments', icon: <NairaIcon size={20} />, roles: ['employer'] },
    { page: 'messaging', label: 'Messages', icon: <MessageSquare size={20} /> },
    { page: 'support', label: 'Help', icon: <HelpCircle size={20} /> },
    { page: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ]

  const navItems = currentUser?.role === 'worker' ? workerNav : employerNav

  // Keep "Explore" lit while browsing a shop, a person or a booking flow that started there
  const EXPLORE_PAGES = ['shops', 'shop', 'people', 'worker-profile', 'booking-slots', 'booking-confirmation', 'ratings-reviews']
  const isActive = (page: string) => page === 'shops' ? EXPLORE_PAGES.includes(currentPage) : currentPage === page

  return (
    <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col fixed left-0 top-16 h-[calc(100vh-64px)]">
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(item.page)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
                  }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-border p-4">
        <button
          onClick={() => { void signOutUser() }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition text-destructive hover:text-destructive"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}