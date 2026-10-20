'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'

// Some screens read an id from the store. These wrappers make sure the store holds the id
// from the URL before the screen draws, so it never flashes "not found" for a frame.

function useRouteId() {
  const params = useParams<{ id?: string }>()
  const raw = params?.id ?? ''
  try { return decodeURIComponent(raw) } catch { return raw }
}

export function WithJob({ children }: { children: React.ReactNode }) {
  const id = useRouteId()
  const selected = useAppStore(s => s.selectedJobId)
  useEffect(() => { if (id && selected !== id) useAppStore.setState({ selectedJobId: id }) }, [id, selected])
  if (!id || selected !== id) return null
  return <>{children}</>
}

export function WithShop({ children }: { children: React.ReactNode }) {
  const id = useRouteId()
  const selected = useAppStore(s => s.selectedShopId)
  useEffect(() => { if (id && selected !== id) useAppStore.setState({ selectedShopId: id }) }, [id, selected])
  if (!id || selected !== id) return null
  return <>{children}</>
}

export function WithReviewPerson({ children }: { children: React.ReactNode }) {
  const id = useRouteId()
  const selected = useAppStore(s => s.reviewWorkerId)
  useEffect(() => { if (id && selected !== id) useAppStore.setState({ reviewWorkerId: id }) }, [id, selected])
  if (!id || selected !== id) return null
  return <>{children}</>
}
