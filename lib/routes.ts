// The one place that knows which URL belongs to which screen.
// Screens keep their old names (the `page` ids), so components keep calling
// setCurrentPage('jobs') and the address bar changes for them.

export type AuthPanel = 'signup' | 'login'

export type RouteIds = {
  shopId?: string | null
  jobId?: string | null
  workerId?: string | null        // person opened inside People search
  reviewWorkerId?: string | null  // person whose reviews are shown
  authPanel?: AuthPanel | null
}

const STATIC_PATHS: Record<string, string> = {
  splash: '/',
  dashboard: '/dashboard',
  jobs: '/jobs',
  people: '/people',
  'worker-profile': '/people',
  shops: '/shops',
  'shop-setup': '/my-shop',
  bookings: '/bookings',
  'booking-confirmation': '/bookings',
  'booking-slots': '/book',
  'post-job': '/post-job',
  messaging: '/messages',
  notifications: '/notifications',
  payments: '/payments',
  settings: '/settings',
  support: '/support',
  profile: '/profile',
  'advanced-search': '/search',
  suggestions: '/suggestions',
  privacy: '/privacy',
  terms: '/terms',
  // sign-in, onboarding and password reset
  'role-select': '/start',
  'phone-verification': '/verify-phone',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  'profile-setup': '/setup',
  'explore-onboarding': '/explore',
}

// path -> page id (the first page listed for a path wins, so /bookings is "bookings")
const PATH_TO_PAGE: Record<string, string> = {}
for (const [page, path] of Object.entries(STATIC_PATHS)) {
  if (!(path in PATH_TO_PAGE)) PATH_TO_PAGE[path] = page
}
PATH_TO_PAGE['/people'] = 'people'

/** Sign-in and onboarding screens. Not useful once you are signed in. */
export const ENTRY_PAGES = ['role-select', 'phone-verification', 'auth', 'forgot-password', 'profile-setup', 'explore-onboarding']

/** Screens a signed-out visitor may open (read-only browsing). */
export const GUEST_PAGES = ['jobs', 'job-details', 'people', 'shops', 'shop', 'privacy', 'terms']

/** Screens that work whether or not you are signed in. */
export const OPEN_PAGES = ['reset-password']

export const isEntryPage = (page: string) => ENTRY_PAGES.includes(page)
export const isGuestPage = (page: string) => GUEST_PAGES.includes(page)
export const isOpenPage = (page: string) => OPEN_PAGES.includes(page)

const enc = (v: string) => encodeURIComponent(v)

/** The URL for a screen. Screens that need an id fall back to a list page without one. */
export function pathFor(page: string, ids: RouteIds = {}): string {
  switch (page) {
    case 'job-details': return ids.jobId ? `/jobs/${enc(ids.jobId)}` : '/jobs'
    case 'apply-job': return ids.jobId ? `/jobs/${enc(ids.jobId)}/apply` : '/jobs'
    case 'job-applicants': return ids.jobId ? `/jobs/${enc(ids.jobId)}/applicants` : '/jobs'
    case 'shop': return ids.shopId ? `/shops/${enc(ids.shopId)}` : '/shops'
    case 'ratings-reviews': return ids.reviewWorkerId ? `/reviews/${enc(ids.reviewWorkerId)}` : '/dashboard'
    case 'auth': return ids.authPanel === 'login' ? '/login' : '/signup'
    default: return STATIC_PATHS[page] ?? '/'
  }
}

export type ParsedPath = {
  page: string
  shopId?: string
  jobId?: string
  workerId?: string
  reviewWorkerId?: string
  authPanel?: AuthPanel
}

/** Which screen (and which ids) a URL means. Unknown URLs give page "not-found". */
export function pageFromPath(pathname: string): ParsedPath {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (clean === '/login') return { page: 'auth', authPanel: 'login' }
  if (clean === '/signup') return { page: 'auth', authPanel: 'signup' }
  if (clean in PATH_TO_PAGE) return { page: PATH_TO_PAGE[clean] }

  const safe = (v: string) => { try { return decodeURIComponent(v) } catch { return v } }
  let m = clean.match(/^\/jobs\/([^/]+)$/)
  if (m) return { page: 'job-details', jobId: safe(m[1]) }
  m = clean.match(/^\/jobs\/([^/]+)\/apply$/)
  if (m) return { page: 'apply-job', jobId: safe(m[1]) }
  m = clean.match(/^\/jobs\/([^/]+)\/applicants$/)
  if (m) return { page: 'job-applicants', jobId: safe(m[1]) }
  m = clean.match(/^\/shops\/([^/]+)$/)
  if (m) return { page: 'shop', shopId: safe(m[1]) }
  m = clean.match(/^\/people\/([^/]+)$/)
  if (m) return { page: 'people', workerId: safe(m[1]) }
  m = clean.match(/^\/reviews\/([^/]+)$/)
  if (m) return { page: 'ratings-reviews', reviewWorkerId: safe(m[1]) }

  return { page: 'not-found' }
}

/** Old shared links looked like /?p=shop&shop=abc. Turn them into the new URL. */
export function pathFromLegacySearch(search: string): string | null {
  const q = new URLSearchParams(search)
  const p = q.get('p')
  if (!p || p === 'splash') return null
  const path = pathFor(p, {
    shopId: q.get('shop'),
    jobId: q.get('job'),
    reviewWorkerId: q.get('worker'),
  })
  return path === '/' ? null : path
}
