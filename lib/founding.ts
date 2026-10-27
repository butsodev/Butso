'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// The first 100 members. At most 100 ids, so we load the list once and share it everywhere.
let cache: Set<string> | null = null
let inflight: Promise<Set<string>> | null = null

function load(): Promise<Set<string>> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = (async () => {
      const { data } = await supabase.from('founding_members').select('id')
      cache = new Set((data ?? []).map(r => r.id as string))
      return cache
    })().catch(() => { inflight = null; return new Set<string>() })
  }
  return inflight
}

export function useFoundingIds(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(cache ?? new Set())
  useEffect(() => {
    let alive = true
    load().then(s => { if (alive) setIds(s) })
    return () => { alive = false }
  }, [])
  return ids
}
