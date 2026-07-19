'use client'

import { useAppStore } from '@/lib/store'
import {
  Home,
  Briefcase,
  Zap,
  MessageSquare,
  Calendar,
  DollarSign,
  HelpCircle,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react'

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
    { page: 'bookings', label: 'My Bookings', icon: <Calendar size={20} />, roles: ['worker'] },
    { page: 'payments', label: 'Earnings', icon: <DollarSign size={20} />, roles: ['worker'] },
    { page: 'messaging', label: 'Messages', icon: <MessageSquare size={20} /> },
    { page: 'support', label: 'Help', icon: <HelpCircle size={20} /> },
    { page: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ]

  const employerNav: NavItem[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, roles: ['employer'] },
    { page: 'post-job', label: 'Post Job', icon: <Zap size={20} />, roles: ['employer'] },
    { page: 'bookings', label: 'Bookings', icon: <Calendar size={20} />, roles: ['employer'] },
    { page: 'payments', label: 'Payments', icon: <DollarSign size={20} />, roles: ['employer'] },
    { page: 'messaging', label: 'Messages', icon: <MessageSquare size={20} /> },
    { page: 'support', label: 'Help', icon: <HelpCircle size={20} /> },
    { page: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ]

  const navItems = currentUser?.role === 'worker' ? workerNav : employerNav

  return (
    <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col fixed left-0 top-16 h-[calc(100vh-64px)]">
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === item.page
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
          onClick={() => {
            useAppStore.setState({ currentUser: null, currentPage: 'splash' })
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition text-destructive hover:text-destructive"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}