'use client'

// Date of birth as three scroll wheels (day, month, year), like a phone's date picker.
// Each column scrolls and snaps; items fade, shrink, blur and tilt the further they are from
// the centre, so the chosen value is always obvious. Tap any item to jump to it.
//
// The wheel effect is applied straight to the DOM on each animation frame (no React re-render
// while scrolling), so it stays smooth on cheap phones. The value is committed once the
// column settles. Keyboard: each column is a spin button (arrows, Page Up/Down, Home/End).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const ITEM = 44          // px per row (also the tap target height)
const VISIBLE = 5        // rows visible, the middle one is the selection
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const daysIn = (year: number, month: number) => new Date(year, month + 1, 0).getDate() // month 0-11
const pad = (n: number) => String(n).padStart(2, '0')

type Parts = { y: number; m: number; d: number } // m 0-11, d 1-31

function parse(v: string): Parts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null
}

type WheelProps = {
  label: string
  items: string[]
  index: number | null         // null = nothing chosen yet (shows a starting point, dimmed)
  startIndex: number           // where to sit before anything is chosen
  onPick: (i: number) => void
  reduce: boolean
  className?: string
}

function Wheel({ label, items, index, startIndex, onPick, reduce, className = '' }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Where our own scrollTo is heading. Scroll events that end there are ours, not a choice.
  const programmatic = useRef<number | null>(null)
  const current = index ?? startIndex

  // Fade / shrink / blur / tilt every row by its distance from the centre
  const paint = useCallback(() => {
    const el = ref.current
    if (!el) return
    const pos = el.scrollTop / ITEM
    el.querySelectorAll<HTMLElement>('[data-i]').forEach(node => {
      const d = Number(node.dataset.i) - pos
      const a = Math.min(Math.abs(d), 3)
      node.style.opacity = String(Math.max(0.15, 1 - a * 0.3))
      node.style.filter = a < 0.35 ? 'none' : `blur(${(a * 0.7).toFixed(2)}px)`
      node.style.transform = reduce
        ? `scale(${(1 - a * 0.06).toFixed(3)})`
        : `perspective(400px) rotateX(${(-d * 18).toFixed(1)}deg) scale(${(1 - a * 0.08).toFixed(3)})`
    })
  }, [reduce])

  const scrollToIndex = useCallback((i: number, smooth: boolean) => {
    const el = ref.current
    if (!el) return
    const top = i * ITEM
    if (Math.abs(el.scrollTop - top) < 1) { paint(); return } // already there: no scroll event will come
    programmatic.current = top
    el.scrollTo({ top, behavior: smooth && !reduce ? 'smooth' : 'auto' })
    paint()
  }, [paint, reduce])

  // Keep the wheel on the current value (first paint, or when the list changes length)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const want = Math.min(current, items.length - 1)
    if (Math.round(el.scrollTop / ITEM) !== want) scrollToIndex(want, false)
    else paint()
  }, [current, items.length, scrollToIndex, paint])

  const onScroll = () => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(paint)
    if (settle.current) clearTimeout(settle.current)
    // Commit once the column stops moving (works with and without the scrollend event)
    settle.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const target = programmatic.current
      programmatic.current = null
      if (target !== null && Math.abs(el.scrollTop - target) < 2) return // our own scroll, not a choice
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM)))
      if (Math.abs(el.scrollTop - i * ITEM) > 1) {
        programmatic.current = i * ITEM
        el.scrollTo({ top: i * ITEM, behavior: reduce ? 'auto' : 'smooth' })
      }
      // A scroll by the person always counts as a choice, even if it lands on the start value
      if (i !== index || index === null) onPick(i)
    }, 110)
  }

  useEffect(() => () => { cancelAnimationFrame(frame.current); if (settle.current) clearTimeout(settle.current) }, [])

  const step = (delta: number) => {
    const i = Math.max(0, Math.min(items.length - 1, current + delta))
    onPick(i)
    scrollToIndex(i, true)
  }

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 5, PageUp: -5 }
    if (e.key in map) { e.preventDefault(); step(map[e.key]) }
    else if (e.key === 'Home') { e.preventDefault(); step(-items.length) }
    else if (e.key === 'End') { e.preventDefault(); step(items.length) }
  }

  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={index === null ? 'Not chosen' : items[index]}
      aria-valuenow={index ?? undefined}
      aria-valuemin={0}
      aria-valuemax={items.length - 1}
      onScroll={onScroll}
      onKeyDown={onKey}
      className={`relative z-[1] overflow-y-auto overscroll-contain snap-y snap-mandatory scrollbar-hide rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      style={{ height: ITEM * VISIBLE, paddingBlock: ITEM * Math.floor(VISIBLE / 2) }}
    >
      {items.map((it, i) => (
        <div key={it} data-i={i} aria-hidden="true"
          onClick={() => { onPick(i); scrollToIndex(i, true) }}
          className={`flex snap-center cursor-pointer select-none items-center justify-center text-lg font-semibold tabular-nums will-change-transform ${index === null ? 'text-muted-foreground' : 'text-foreground'}`}
          style={{ height: ITEM }}>
          {it}
        </div>
      ))}
    </div>
  )
}

export function DateWheelPicker({ value, onChange, label = 'Date of birth', minYear = 1920, defaultAge = 25 }: {
  value: string                       // YYYY-MM-DD, or '' until chosen
  onChange: (v: string) => void
  label?: string
  minYear?: number
  defaultAge?: number                 // where the year wheel starts before anything is chosen
}) {
  const reduce = !!useReducedMotion()
  const now = new Date()
  const maxYear = now.getFullYear()
  const years = useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i)), [minYear, maxYear])

  // Partly chosen values live in state until all three are picked. (While incomplete the
  // parent's value stays '', so the picker must re-render from its own state.)
  const full = parse(value)
  const [picked, setPicked] = useState<{ y: number | null; m: number | null; d: number | null }>(
    () => full ?? { y: null, m: null, d: null })
  useEffect(() => { if (full) setPicked(p => (p.y === full.y && p.m === full.m && p.d === full.d ? p : full)) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value])
  const { y, m, d } = picked

  const dayCount = daysIn(y ?? 2000, m ?? 0) // 2000 is a leap year: allow 29 Feb until the year is known
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => String(i + 1)), [dayCount])

  const commit = (next: Partial<Parts>) => {
    setPicked(prev => {
      const p = { ...prev, ...next }
      // 31 March -> February: move the day to the last day of the new month
      if (p.d !== null && p.y !== null && p.m !== null) p.d = Math.min(p.d, daysIn(p.y, p.m))
      const v = p.y !== null && p.m !== null && p.d !== null ? `${p.y}-${pad(p.m + 1)}-${pad(p.d)}` : ''
      queueMicrotask(() => onChange(v)) // tell the parent after this update, not during it
      return p
    })
  }

  const age = full ? (() => {
    let a = now.getFullYear() - full.y
    if (now.getMonth() < full.m || (now.getMonth() === full.m && now.getDate() < full.d)) a--
    return a
  })() : null

  const chosen = [d !== null ? d : null, m !== null ? MONTHS[m] : null, y].filter(v => v !== null)

  return (
    <div role="group" aria-label={label}>
      <div className="relative grid grid-cols-[1fr_1.6fr_1.2fr] gap-1 rounded-2xl border-2 border-border bg-card px-2">
        {/* The selection band, behind the middle row */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-2 rounded-xl bg-secondary"
          style={{ top: ITEM * Math.floor(VISIBLE / 2), height: ITEM }} />
        <Wheel label="Day" items={days} index={d !== null ? Math.min(d, dayCount) - 1 : null} startIndex={0}
          onPick={i => commit({ d: i + 1 })} reduce={reduce} />
        <Wheel label="Month" items={MONTHS} index={m} startIndex={0}
          onPick={i => commit({ m: i })} reduce={reduce} />
        <Wheel label="Year" items={years} index={y !== null ? y - minYear : null} startIndex={maxYear - defaultAge - minYear}
          onPick={i => commit({ y: minYear + i })} reduce={reduce} />
        {/* Soft fade at the top and bottom edges */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-16 rounded-t-2xl bg-gradient-to-b from-card to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16 rounded-b-2xl bg-gradient-to-t from-card to-transparent" />
      </div>
      <p className="mt-2 min-h-5 text-sm text-muted-foreground" aria-live="polite">
        {full
          ? <><span className="font-semibold text-foreground">{full.d} {MONTHS[full.m]} {full.y}</span>{age !== null && age >= 0 ? ` · ${age} years old` : ''}</>
          : chosen.length > 0 ? `Now pick the ${[d === null && 'day', m === null && 'month', y === null && 'year'].filter(Boolean).join(' and ')}.`
          : 'Scroll each wheel, or tap a number, to choose.'}
      </p>
    </div>
  )
}
