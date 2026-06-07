import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'worker' | 'employer'

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
  workerId: string
  employerId: string
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

interface AppStore {
  // Auth
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  
  // Navigation
  currentPage: string
  setCurrentPage: (page: string) => void
  
  // Theme
  darkMode: boolean
  setDarkMode: (isDark: boolean) => void
  toggleDarkMode: () => void
  
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
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      currentPage: 'splash',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      darkMode: false,
      setDarkMode: (isDark) => set({ darkMode: isDark }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      jobs: [],
      setJobs: (jobs) => set({ jobs }),
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
      
      bookings: [],
      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
      
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
    }),
    {
      name: 'butso-store',
    }
  )
)
