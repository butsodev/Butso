'use client'

/**
 * AuthShell — wraps every unauthenticated screen (landing, role select,
 * phone verify, profile setup). Provides:
 *   • Back button (← goes to previous page via store history or a fallback)
 *   • Theme toggle (sun/moon) so dark mode works before the Header mounts
 *   • Butsó logo linking home
 * 
 * Usage:
 *   <AuthShell back="splash">   ← shows back arrow to 'splash'
 *   <AuthShell>                 ← no back arrow (landing page)
 */

import { motion } from 'framer-motion'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface AuthShellProps {
    children: React.ReactNode
    back?: string        // page to navigate back to — omit to hide back button
    showLogo?: boolean   // default false — most auth screens have their own logo
}

export function AuthShell({ children, back, showLogo = false }: AuthShellProps) {
    const { setCurrentPage, darkMode, toggleDarkMode } = useAppStore()

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* ── Top bar ── */}
            <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
                {/* Left: back button or spacer */}
                <div className="w-10">
                    {back && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentPage(back)}
                            className="p-2 -ml-2 rounded-xl hover:bg-secondary transition text-foreground"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </motion.button>
                    )}
                </div>

                {/* Centre: logo */}
                {showLogo && (
                    <button
                        onClick={() => setCurrentPage('splash')}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-black text-xs">B</span>
                        </div>
                        <span className="text-lg font-black text-foreground tracking-tight">Butsó</span>
                    </button>
                )}

                {/* Right: theme toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDarkMode}
                    className="p-2 rounded-xl hover:bg-secondary transition text-foreground"
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </motion.button>
            </div>

            {/* ── Page content ── */}
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    )
}