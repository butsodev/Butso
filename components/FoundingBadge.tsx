'use client'

import { Award } from 'lucide-react'
import { useFoundingIds } from '@/lib/founding'

/** "Founding Member" badge for the first 100 members. Renders nothing for everyone else. */
export function FoundingBadge({ userId, compact = false }: { userId?: string; compact?: boolean }) {
  const ids = useFoundingIds()
  if (!userId || !ids.has(userId)) return null
  if (compact) {
    return (
      <span className="shrink-0 inline-flex text-amber-500" title="Founding Member: one of the first 100" aria-label="Founding Member">
        <Award size={14} />
      </span>
    )
  }
  return (
    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30 px-2 py-0.5 rounded-full"
      title="One of the first 100 members">
      <Award size={11} /> Founding Member
    </span>
  )
}
