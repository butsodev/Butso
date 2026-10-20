'use client'

import { useAppStore } from '@/lib/store'
import { LandingPage } from '@/components/LandingPage'

export default function Home() {
  const currentUser = useAppStore(s => s.currentUser)
  // Signed-in people are sent to their dashboard by AuthGate
  if (currentUser) return null
  return <LandingPage />
}
