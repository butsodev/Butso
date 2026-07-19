'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * ThemeProvider — mounts once at the root, always applies/removes
 * the 'dark' class on <html> based on store state.
 * Works on ALL pages including unauthenticated onboarding screens.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const darkMode = useAppStore(s => s.darkMode)

    useEffect(() => {
        const root = document.documentElement
        if (darkMode) {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }, [darkMode])

    return <>{children}</>
}