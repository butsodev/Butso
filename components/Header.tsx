'use client'

import { Menu, X, MessageCircle, Bell, Moon, Sun, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { currentUser, setCurrentPage, darkMode, toggleDarkMode, currentPage } = useAppStore()

  useEffect(() => {
    setIsMounted(true)
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        {/* Back Button & Logo */}
        <div className="flex items-center gap-3">
          {isMounted && currentPage !== 'dashboard' && (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="p-2 hover:bg-secondary rounded-lg transition"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
          )}
          <div 
            className="text-2xl font-bold text-primary cursor-pointer"
            onClick={() => setCurrentPage('dashboard')}
          >
            Butsó
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {currentUser?.role === 'worker' && (
            <>
              <button 
                onClick={() => setCurrentPage('jobs')}
                className="text-foreground hover:text-primary transition"
              >
                Browse Jobs
              </button>
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="text-foreground hover:text-primary transition"
              >
                Dashboard
              </button>
            </>
          )}
          {currentUser?.role === 'employer' && (
            <>
              <button 
                onClick={() => setCurrentPage('post-job')}
                className="text-foreground hover:text-primary transition"
              >
                Post Job
              </button>
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="text-foreground hover:text-primary transition"
              >
                Dashboard
              </button>
            </>
          )}
        </nav>

        {/* Icons & Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setCurrentPage('messaging')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <MessageCircle size={20} className="text-foreground" />
          </button>
          <button 
            onClick={() => setCurrentPage('notifications')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <Bell size={20} className="text-foreground" />
          </button>
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:bg-secondary rounded-lg transition"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? (
              <Sun size={20} className="text-foreground" />
            ) : (
              <Moon size={20} className="text-foreground" />
            )}
          </button>
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && currentUser && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-2">
            {currentUser.role === 'worker' && (
              <>
                <button 
                  onClick={() => {
                    setCurrentPage('jobs')
                    setIsMenuOpen(false)
                  }}
                  className="py-2 px-4 text-left hover:bg-secondary rounded transition"
                >
                  Browse Jobs
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('dashboard')
                    setIsMenuOpen(false)
                  }}
                  className="py-2 px-4 text-left hover:bg-secondary rounded transition"
                >
                  Dashboard
                </button>
              </>
            )}
            {currentUser.role === 'employer' && (
              <>
                <button 
                  onClick={() => {
                    setCurrentPage('post-job')
                    setIsMenuOpen(false)
                  }}
                  className="py-2 px-4 text-left hover:bg-secondary rounded transition"
                >
                  Post Job
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('dashboard')
                    setIsMenuOpen(false)
                  }}
                  className="py-2 px-4 text-left hover:bg-secondary rounded transition"
                >
                  Dashboard
                </button>
              </>
            )}
            <button 
              onClick={() => {
                setCurrentPage('payments')
                setIsMenuOpen(false)
              }}
              className="py-2 px-4 text-left hover:bg-secondary rounded transition"
            >
              {currentUser.role === 'worker' ? 'Earnings' : 'Payments'}
            </button>
            <button 
              onClick={() => {
                setCurrentPage('support')
                setIsMenuOpen(false)
              }}
              className="py-2 px-4 text-left hover:bg-secondary rounded transition"
            >
              Support
            </button>
            <button 
              onClick={() => {
                setCurrentPage('settings')
                setIsMenuOpen(false)
              }}
              className="py-2 px-4 text-left hover:bg-secondary rounded transition"
            >
              Settings
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
