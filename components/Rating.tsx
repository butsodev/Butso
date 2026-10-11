'use client'

import { Award } from 'lucide-react'

// Rating display without star glyphs.
//  - RatingBadge: amber pill with a medal icon and the score  (4.8)
//  - RatingMeter: five small bars, filled in amber up to the score

const SIZES = {
  xs: { text: 'text-[11px]', icon: 11, pad: 'px-1.5 py-0.5', gap: 'gap-0.5' },
  sm: { text: 'text-xs', icon: 13, pad: 'px-2 py-0.5', gap: 'gap-1' },
  md: { text: 'text-sm', icon: 15, pad: 'px-2.5 py-1', gap: 'gap-1.5' },
  lg: { text: 'text-lg', icon: 20, pad: 'px-3 py-1.5', gap: 'gap-2' },
} as const

export function RatingBadge({
  value,
  size = 'sm',
  className = '',
  onDark = false,
}: {
  value: number | string
  size?: keyof typeof SIZES
  className?: string
  onDark?: boolean // for use on top of a coloured/primary background
}) {
  const s = SIZES[size]
  const n = typeof value === 'number' ? value : Number(value)
  const label = Number.isFinite(n) ? n.toFixed(1) : String(value)
  const tone = onDark
    ? 'bg-white/20 text-white'
    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
  return (
    <span className={`inline-flex items-center ${s.gap} ${s.pad} rounded-full font-bold ${s.text} ${tone} ${className}`}>
      <Award size={s.icon} strokeWidth={2.2} aria-hidden />
      {label}
    </span>
  )
}

export function RatingMeter({
  value,
  max = 5,
  size = 'md',
  className = '',
}: {
  value: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}) {
  const filled = Math.round(value)
  const seg = size === 'sm' ? 'w-3 h-1' : 'w-5 h-1.5'
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value.toFixed(1)} out of ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`${seg} rounded-full ${i < filled ? 'bg-amber-500' : 'bg-muted-foreground/25'}`} />
      ))}
    </span>
  )
}
