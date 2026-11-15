'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * ThemeProvider: mounts once at the root and keeps the 'dark' class on <html> in step
 * with the store. Works on every page, signed in or not. The only place that sets it
 * (besides the before-paint script in app/layout.tsx, which applies the same rule).
 *
 * Until the person picks a theme with the toggle (themeChosen), it follows the phone's
 * light/dark setting, including changes while the app is open.
 *
 * It reads the store with getState()/subscribe, not the hook: during hydration the hook
 * returns the store's INITIAL values (themeChosen false, darkMode false), not the saved
 * ones, which would overwrite a saved dark choice and flash the page light.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const apply = () => document.documentElement.classList.toggle('dark', useAppStore.getState().darkMode)
        const follow = () => {
            const s = useAppStore.getState()
            if (!s.themeChosen && s.darkMode !== mq.matches) useAppStore.setState({ darkMode: mq.matches })
        }
        follow()
        apply()
        const unsubscribe = useAppStore.subscribe((s, prev) => { if (s.darkMode !== prev.darkMode) apply() })
        mq.addEventListener('change', follow)
        return () => { unsubscribe(); mq.removeEventListener('change', follow) }
    }, [])

    return <>{children}</>
}
