'use client'

import { Menu, X, MessageCircle, Bell } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentUser, setCurrentPage } = useAppStore()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo */}
        <div 
          className="text-2xl font-bold text-primary cursor-pointer"
          onClick={() => setCurrentPage('dashboard')}
        >
          Butsó
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

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-secondary rounded-lg transition">
            <MessageCircle size={20} className="text-foreground" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition">
            <Bell size={20} className="text-foreground" />
          </button>
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && currentUser && (
        <div className="md:hidden border-t border-border bg-white">
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
