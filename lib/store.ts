import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'worker' | 'employer' | 'exploring'
export type DashboardMode = 'worker' | 'employer'

export interface User {
  id: string
  phone: string
  name: string
  username: string          // unique, chosen at signup
  role: UserRole
  avatar?: string
  bio?: string
  skills?: string[]
  rating?: number
  completedJobs?: number
  shopId?: string           // set if this worker has a shop
}

export interface Job {
  id: string
  title: string
  description: string
  category: string
  budget: number
  location: string
  employerId: string
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  applicants: string[]
  selectedWorkerId?: string
  createdAt: string
  deadline?: string
}

export interface Booking {
  id: string
  type: 'job' | 'shop'           // job-based vs shop-based booking
  jobId?: string
  jobTitle?: string
  shopId?: string
  shopName?: string
  serviceId?: string
  serviceName?: string
  workerId: string
  workerName?: string
  employerId: string
  employerName?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  date: string
  slots: string[]
  totalPrice: number
  negotiated: boolean            // was price negotiated?
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

export interface Notification {
  id: string
  type: 'application' | 'booking' | 'message' | 'payment' | 'review'
  title: string
  body: string
  read: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  type: 'earned' | 'escrow' | 'withdrawal' | 'refund'
  amount: number
  jobTitle?: string
  counterpartyName?: string
  status: 'completed' | 'held' | 'pending' | 'failed'
  createdAt: string
}

/* ─── Shop types ──────────────────────────────────────────────────────────── */

export interface ShopService {
  id: string
  name: string                          // e.g. "Haircut", "Full shave"
  description?: string
  price: number
  pricingType: 'fixed' | 'negotiable'   // fixed = book & pay; negotiable = send request
  durationMinutes?: number              // how long the service takes
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DayHours {
  open: boolean
  from: string   // e.g. "08:00"
  to: string     // e.g. "18:00"
}

export type OpeningHours = Record<DayOfWeek, DayHours>

export const DEFAULT_HOURS: OpeningHours = {
  mon: { open: true, from: '08:00', to: '18:00' },
  tue: { open: true, from: '08:00', to: '18:00' },
  wed: { open: true, from: '08:00', to: '18:00' },
  thu: { open: true, from: '08:00', to: '18:00' },
  fri: { open: true, from: '08:00', to: '18:00' },
  sat: { open: true, from: '09:00', to: '15:00' },
  sun: { open: false, from: '09:00', to: '13:00' },
}

export interface ShopReview {
  id: string
  userId: string
  userName: string
  rating: number        // 1–5
  comment: string
  createdAt: string
}

export interface PortfolioItem {
  id: string
  imageUrl: string          // URL or base64 — swap for real upload later
  caption: string
  serviceId?: string        // links to a service — tapping suggests booking it
  pinned: boolean           // pinned items show at top of profile
  createdAt: string
}

export type ShopDefaultTab = 'services' | 'portfolio' | 'reviews'

export interface Shop {
  id: string
  ownerId: string
  ownerName: string
  ownerUsername: string
  name: string
  tagline?: string                // "Known for the cleanest fades in Wukari"
  category: string
  description: string
  location: string
  isMobile: boolean
  phone?: string
  services: ShopService[]
  portfolio: PortfolioItem[]      // owner's work showcase
  defaultTab: ShopDefaultTab      // which tab visitors see first
  openingHours: OpeningHours
  rating: number
  reviewCount: number
  reviews: ShopReview[]
  isOpen: boolean
  verified: boolean
  createdAt: string
}

/* ─── Preference / behaviour profile ─────────────────────────────────────── */
export interface UserPreferences {
  chosenCategories: string[]
  viewed: Record<string, number>
  saved: Record<string, number>
  applied: Record<string, number>
  searched: Record<string, number>
}

const EMPTY_PREFS: UserPreferences = {
  chosenCategories: [],
  viewed: {},
  saved: {},
  applied: {},
  searched: {},
}

const W = { applied: 5, saved: 3, searched: 2, viewed: 1, chosen: 1 }

export function rankCategories(prefs: UserPreferences, allCategories: string[]): string[] {
  const score = (cat: string) => {
    const c = cat.toLowerCase()
    return (
      (prefs.applied[c] ?? 0) * W.applied +
      (prefs.saved[c] ?? 0) * W.saved +
      (prefs.searched[c] ?? 0) * W.searched +
      (prefs.viewed[c] ?? 0) * W.viewed +
      (prefs.chosenCategories.includes(c) ? W.chosen : 0)
    )
  }
  return [...allCategories].sort((a, b) => score(b) - score(a))
}

/* ─── Username helpers ────────────────────────────────────────────────────── */
export function generateUsernameFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20)
}

export function isUsernameAvailable(username: string, existingUsers: User[], excludeId?: string): boolean {
  return !existingUsers.some(u =>
    u.username?.toLowerCase() === username.toLowerCase() && u.id !== excludeId
  )
}

/* ─── isShopOpenNow helper ────────────────────────────────────────────────── */
export function isShopOpenNow(hours: OpeningHours): boolean {
  const now = new Date()
  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = days[now.getDay()]
  const todayHours = hours[today]
  if (!todayHours.open) return false
  const [fh, fm] = todayHours.from.split(':').map(Number)
  const [th, tm] = todayHours.to.split(':').map(Number)
  const nowMins = now.getHours() * 60 + now.getMinutes()
  return nowMins >= fh * 60 + fm && nowMins <= th * 60 + tm
}

/* ─── Store interface ─────────────────────────────────────────────────────── */
export interface AppStore {
  // Auth
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // Navigation
  currentPage: string
  setCurrentPage: (page: string) => void
  selectedShopId: string | null
  setSelectedShopId: (id: string | null) => void
  selectedJobId: string | null
  setSelectedJobId: (id: string | null) => void
  pageHistory: string[]
  goBack: () => void

  // Theme
  darkMode: boolean
  setDarkMode: (isDark: boolean) => void
  toggleDarkMode: () => void

  // Dashboard mode
  dashboardMode: DashboardMode
  setDashboardMode: (mode: DashboardMode) => void

  // Jobs
  jobs: Job[]
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void

  // Bookings
  bookings: Booking[]
  setBookings: (bookings: Booking[]) => void
  addBooking: (booking: Booking) => void

  // Messages
  messages: Message[]
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void

  // Notifications
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  // Transactions
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void

  // Shops
  shops: Shop[]
  setShops: (shops: Shop[]) => void
  addShop: (shop: Shop) => void
  updateShop: (shopId: string, updates: Partial<Shop>) => void
  getShopByOwner: (ownerId: string) => Shop | undefined
  addShopReview: (shopId: string, review: ShopReview) => void
  addPortfolioItem: (shopId: string, item: PortfolioItem) => void
  removePortfolioItem: (shopId: string, itemId: string) => void
  togglePortfolioPin: (shopId: string, itemId: string) => void
  setShopDefaultTab: (shopId: string, tab: ShopDefaultTab) => void

  // Users (for username validation)
  allUsers: User[]
  setAllUsers: (users: User[]) => void

  // Preferences & behaviour tracking
  preferences: UserPreferences
  setChosenCategories: (cats: string[]) => void
  trackView: (category: string) => void
  trackSave: (category: string) => void
  trackApply: (category: string) => void
  trackSearch: (term: string) => void
  getRankedCategories: (allCategories: string[]) => string[]
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      currentPage: 'splash',
      pageHistory: [],
      selectedShopId: null,
      setSelectedShopId: (id) => set({ selectedShopId: id }),
      selectedJobId: null,
      setSelectedJobId: (id) => set({ selectedJobId: id }),

      setCurrentPage: (page) => {
        const state = get()
        const newHistory = state.pageHistory.slice(-9)
        set({
          currentPage: page,
          pageHistory: [...newHistory, state.currentPage].filter(p => p !== 'splash'),
        })
      },
      goBack: () => {
        const state = get()
        if (state.pageHistory.length > 0) {
          const newHistory = state.pageHistory.slice(0, -1)
          const prevPage = newHistory[newHistory.length - 1] || 'dashboard'
          set({ currentPage: prevPage, pageHistory: newHistory })
        }
      },

      darkMode: false,
      setDarkMode: (isDark) => set({ darkMode: isDark }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      dashboardMode: 'worker',
      setDashboardMode: (mode) => set({ dashboardMode: mode }),

      jobs: [],
      setJobs: (jobs) => set({ jobs }),
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),

      bookings: [],
      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),

      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),

      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        })),

      transactions: [],
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) =>
        set((state) => ({ transactions: [transaction, ...state.transactions] })),

      // ── Shops ──────────────────────────────────────────────────────────────
      shops: [],
      setShops: (shops) => set({ shops }),
      addShop: (shop) => set((state) => ({ shops: [shop, ...state.shops] })),
      updateShop: (shopId, updates) =>
        set((state) => ({
          shops: state.shops.map(s => s.id === shopId ? { ...s, ...updates } : s),
        })),
      getShopByOwner: (ownerId) => get().shops.find(s => s.ownerId === ownerId),
      addShopReview: (shopId, review) =>
        set((state) => ({
          shops: state.shops.map(s => {
            if (s.id !== shopId) return s
            const reviews = [review, ...s.reviews]
            const rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            return { ...s, reviews, reviewCount: reviews.length, rating: Math.round(rating * 10) / 10 }
          }),
        })),

      addPortfolioItem: (shopId, item) =>
        set((state) => ({
          shops: state.shops.map(s =>
            s.id === shopId ? { ...s, portfolio: [item, ...s.portfolio] } : s
          ),
        })),

      removePortfolioItem: (shopId, itemId) =>
        set((state) => ({
          shops: state.shops.map(s =>
            s.id === shopId ? { ...s, portfolio: s.portfolio.filter(p => p.id !== itemId) } : s
          ),
        })),

      togglePortfolioPin: (shopId, itemId) =>
        set((state) => ({
          shops: state.shops.map(s =>
            s.id === shopId
              ? { ...s, portfolio: s.portfolio.map(p => p.id === itemId ? { ...p, pinned: !p.pinned } : p) }
              : s
          ),
        })),

      setShopDefaultTab: (shopId, tab) =>
        set((state) => ({
          shops: state.shops.map(s => s.id === shopId ? { ...s, defaultTab: tab } : s),
        })),

      // ── Users ──────────────────────────────────────────────────────────────
      allUsers: [],
      setAllUsers: (users) => set({ allUsers: users }),

      // ── Preferences ────────────────────────────────────────────────────────
      preferences: EMPTY_PREFS,

      setChosenCategories: (cats) =>
        set((s) => ({
          preferences: { ...s.preferences, chosenCategories: cats.map(c => c.toLowerCase()) },
        })),

      trackView: (category) =>
        set((s) => {
          const c = category.toLowerCase()
          return {
            preferences: {
              ...s.preferences,
              viewed: { ...s.preferences.viewed, [c]: (s.preferences.viewed[c] ?? 0) + 1 },
            },
          }
        }),

      trackSave: (category) =>
        set((s) => {
          const c = category.toLowerCase()
          return {
            preferences: {
              ...s.preferences,
              saved: { ...s.preferences.saved, [c]: (s.preferences.saved[c] ?? 0) + 1 },
            },
          }
        }),

      trackApply: (category) =>
        set((s) => {
          const c = category.toLowerCase()
          return {
            preferences: {
              ...s.preferences,
              applied: { ...s.preferences.applied, [c]: (s.preferences.applied[c] ?? 0) + 1 },
            },
          }
        }),

      trackSearch: (term) =>
        set((s) => {
          const c = term.toLowerCase()
          return {
            preferences: {
              ...s.preferences,
              searched: { ...s.preferences.searched, [c]: (s.preferences.searched[c] ?? 0) + 1 },
            },
          }
        }),

      getRankedCategories: (allCategories) =>
        rankCategories(get().preferences, allCategories),
    }),
    { name: 'butso-store' }
  )
)