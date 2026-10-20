// Lets non-React code (the Zustand store) move between real Next.js routes.
// A small client component (AuthGate) registers the router once.

import { pathFor, type RouteIds } from '@/lib/routes'

type RouterLike = {
  push: (href: string) => void
  replace: (href: string) => void
  back: () => void
}

let router: RouterLike | null = null
let lastRequest = { path: '', at: 0 }
let replaceNext = false

// Paths visited inside the app during this visit. Used so "Back" goes to the previous
// screen, or to a sensible fallback when the page was opened straight from a link.
let stack: string[] = []

export function registerRouter(r: RouterLike) {
  router = r
}

/** Called whenever the URL changes. Keeps the in-app history in step. */
export function recordPath(pathname: string) {
  if (stack[stack.length - 1] === pathname) return
  if (replaceNext) {
    replaceNext = false
    stack[stack.length - 1] = pathname
    if (stack.length === 0) stack = [pathname]
    return
  }
  // Moving back to the screen before this one
  if (stack.length >= 2 && stack[stack.length - 2] === pathname) {
    stack.pop()
    return
  }
  stack.push(pathname)
  if (stack.length > 30) stack = stack.slice(-30)
}

/** True if we just asked to move somewhere, so guards do not fight a navigation in progress. */
export function navigatedRecently(ms = 1500) {
  return Date.now() - lastRequest.at < ms
}

export function navigateToPath(path: string, opts: { replace?: boolean } = {}) {
  if (typeof window === 'undefined') return
  if (window.location.pathname === path) return
  lastRequest = { path, at: Date.now() }
  if (!router) { window.location.assign(path); return }
  if (opts.replace) { replaceNext = true; router.replace(path) } else router.push(path)
}

export function navigateToPage(page: string, ids: RouteIds = {}, opts: { replace?: boolean } = {}) {
  navigateToPath(pathFor(page, ids), opts)
}

/** Go to the previous in-app screen. If there is none, go to `fallbackPath`. */
export function navigateBack(fallbackPath: string) {
  if (typeof window === 'undefined') return
  if (router && stack.length >= 2) {
    lastRequest = { path: stack[stack.length - 2], at: Date.now() }
    router.back()
  } else {
    navigateToPath(fallbackPath)
  }
}
