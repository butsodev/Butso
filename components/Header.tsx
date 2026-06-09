'use client'

import { MessageCircle, Bell, Moon, Sun, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'

export function Header() {
  const [isMounted, setIsMounted] = useState(false)
  const { currentUser, setCurrentPage, darkMode, toggleDarkMode, currentPage, notifications } = useAppStore()

  useEffect(() => {
    setIsMounted(true)
    const root = document.documentElement
    if (darkMode) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [darkMode])

  const unreadNotifs = notifications?.filter((n: import('@/lib/store').Notification) => !n.read).length ?? 0

  const showBack = isMounted && currentPage !== 'dashboard'

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 h-14">
        {/* Left — back or logo */}
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="p-2 -ml-1 hover:bg-secondary rounded-xl transition"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
          )}
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">B</span>
            </div>
            <span className="text-lg font-black text-foreground tracking-tight">Butsó</span>
          </button>
        </div>

        {/* Right — icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage('messaging')}
            className="p-2 hover:bg-secondary rounded-xl transition"
            aria-label="Messages"
          >
            <MessageCircle size={20} className="text-foreground" />
          </button>

          <button
            onClick={() => setCurrentPage('notifications')}
            className="relative p-2 hover:bg-secondary rounded-xl transition"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-foreground" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-black rounded-full flex items-center justify-center">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-secondary rounded-xl transition"
            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {isMounted && darkMode
              ? <Sun size={20} className="text-foreground" />
              : <Moon size={20} className="text-foreground" />
            }
          </button>
        </div>
      </div>
    </header>
  )
}