'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SUCCESS_EVENT, type SuccessOptions } from '@/lib/success'

const DOTS = [
  { x: -86, y: -62, c: '#F59E0B', d: 0.05 },
  { x: 80, y: -70, c: '#1B9E6E', d: 0.1 },
  { x: -100, y: 8, c: '#3B82F6', d: 0.15 },
  { x: 98, y: 14, c: '#EC4899', d: 0.08 },
  { x: -60, y: 76, c: '#1B9E6E', d: 0.12 },
  { x: 64, y: 80, c: '#F59E0B', d: 0.18 },
  { x: 0, y: -96, c: '#EC4899', d: 0.14 },
  { x: -8, y: 98, c: '#3B82F6', d: 0.2 },
]

/**
 * Listens for showSuccess() and draws the celebration: a pop-in card, a checkmark that
 * draws itself, and a small burst of dots. Sits above everything, including the bottom nav.
 */
export function SuccessHost() {
  const [opts, setOpts] = useState<SuccessOptions | null>(null)
  const reduce = useReducedMotion()
  const primaryRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onShow = (e: Event) => setOpts((e as CustomEvent<SuccessOptions>).detail)
    window.addEventListener(SUCCESS_EVENT, onShow)
    return () => window.removeEventListener(SUCCESS_EVENT, onShow)
  }, [])

  useEffect(() => {
    if (!opts) return
    primaryRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpts(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opts])

  const close = () => setOpts(null)
  const act = () => { const fn = opts?.onAction; setOpts(null); fn?.() }

  return (
    <AnimatePresence>
      {opts && (
        <motion.div
          key="success"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <motion.div
            className="relative w-full max-w-sm rounded-3xl bg-background border border-border shadow-2xl px-6 pt-10 pb-6 text-center"
            initial={reduce ? { opacity: 0 } : { scale: 0.85, y: 24, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="relative mx-auto mb-5 w-24 h-24" aria-hidden="true">
              {/* burst */}
              {!reduce && DOTS.map((d, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full"
                  style={{ background: d.c, marginLeft: -5, marginTop: -5 }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x: d.x, y: d.y, scale: [0, 1.2, 0.8], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.9, delay: 0.25 + d.d, ease: 'easeOut' }}
                />
              ))}
              {/* pulse ring */}
              {!reduce && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-primary/40"
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
                />
              )}
              {/* disc + drawn checkmark */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary flex items-center justify-center shadow-lg"
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 }}
              >
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>
            </div>

            <h2 id="success-title" className="text-2xl font-black text-foreground mb-2">{opts.title}</h2>
            {opts.message && <p className="text-sm text-muted-foreground leading-relaxed mb-6">{opts.message}</p>}

            <div className="flex flex-col gap-2">
              {opts.actionLabel && (
                <button
                  ref={primaryRef}
                  onClick={act}
                  className="w-full min-h-[48px] rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition"
                >
                  {opts.actionLabel}
                </button>
              )}
              <button
                ref={opts.actionLabel ? undefined : primaryRef}
                onClick={close}
                className="w-full min-h-[44px] rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary transition"
              >
                {opts.actionLabel ? 'Done' : 'Continue'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
