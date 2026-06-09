import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'worker' | 'employer' | 'exploring'
export type DashboardMode = 'worker' | 'employer'

export interface User {
  id: string
  phone: string
  name: string
  role: UserRole
  avatar?: string
  bio?: string
  skills?: string[]
  rating?: number
  completedJobs?: number
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
  jobId: string
  jobTitle?: string
  workerId: string
  workerName?: string
  employerId: string
  employerName?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  date: string
  slots: string[]
  totalPrice: number
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

/* ─── Preference / behaviour profile ──────────────────────────────────────
   Lives in the store and persists to localStorage.
   Every tap, view, apply, save increments the right bucket.
   rankCategories() returns categories sorted by score so any
   feed can call it to get a personalised order instantly.
───────────────────────────────────────────────────────────────────────── */
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

interface AppStore {
  // Auth
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // Navigation
  currentPage: string
  setCurrentPage: (page: string) => void
  pageHistory: string[]
  goBack: () => void

  // Theme
  darkMode: boolean
  setDarkMode: (isDark: boolean) => void
  toggleDarkMode: () => void

  // Dashboard mode (worker view vs employer view)
  dashboardMode: DashboardMode
  setDashboardMode: (mode: DashboardMode) => void

  // Data
  jobs: Job[]
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void

  bookings: Booking[]
  setBookings: (bookings: Booking[]) => void
  addBooking: (booking: Booking) => void

  messages: Message[]
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void

  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void

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

      // ── Preferences ──────────────────────────────────────────────────────
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