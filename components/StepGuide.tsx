'use client'

// Step-by-step walkthrough in a pop-up. Pure text and CSS: no video, no images, a few KB.
// Loaded only when someone opens a guide (see HowToGuide), so it never slows the rest of the app.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import type { Guide } from '@/lib/guideContent'

const AUTOPLAY_MS = 7000 // slow on purpose: long enough to read a step twice

export default function StepGuide({ guide, onClose }: { guide: Guide; onClose: () => void }) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reduce = useReducedMotion()
  const last = guide.steps.length - 1
  const step = guide.steps[i]
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI(n => Math.min(n + 1, last))
      if (e.key === 'ArrowLeft') setI(n => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, last])

  useEffect(() => {
    if (!playing) return
    if (i >= last) { setPlaying(false); return }
    const t = setTimeout(() => setI(n => n + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [playing, i, last])

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      role="dialog" aria-modal="true" aria-label={guide.title} onClick={onClose}>
      <motion.div ref={panelRef} initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ duration: 0.22 }}
        className="w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wide">{guide.forWho}</p>
            <h2 className="text-lg font-black text-foreground">{guide.title}</h2>
          </div>
          <button ref={closeRef} aria-label="Close guide" onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* A simple picture of the screen */}
        <div className="mx-auto w-52 rounded-[1.6rem] border-4 border-foreground/80 bg-card overflow-hidden mb-4" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 truncate">{step.screen.title}</div>
              <div className="p-3 space-y-2 min-h-[8.5rem]">
                {(step.screen.rows ?? []).map(r => (
                  <div key={r} className="rounded-lg bg-secondary px-3 py-2 text-[11px] text-muted-foreground truncate">{r}</div>
                ))}
                {step.screen.button && (
                  <div className={`rounded-lg bg-primary text-primary-foreground text-[11px] font-bold text-center px-3 py-2.5 ring-4 ring-primary/30 ${reduce ? '' : 'animate-pulse'}`}>
                    {step.screen.button}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-xs font-bold text-muted-foreground text-center mb-1">Step {i + 1} of {guide.steps.length}</p>
        <p className="text-base text-foreground text-center leading-relaxed min-h-[5.5rem]" aria-live="polite">{step.text}</p>

        <div className="flex justify-center gap-1.5 my-3" aria-hidden="true">
          {guide.steps.map((_, n) => (
            <span key={n} className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setI(n => Math.max(n - 1, 0))} disabled={i === 0} aria-label="Previous step"
            className="min-h-[48px] px-4 rounded-xl border border-border font-bold text-sm flex items-center gap-1 disabled:opacity-40">
            <ChevronLeft size={16} /> Back
          </button>
          <button onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause autoplay' : 'Play automatically'}
            className="min-h-[48px] w-12 rounded-xl border border-border flex items-center justify-center">
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          {i < last ? (
            <button onClick={() => setI(n => n + 1)}
              className="flex-1 min-h-[48px] rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-1">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={onClose} className="flex-1 min-h-[48px] rounded-xl bg-primary text-primary-foreground font-bold text-sm">Done</button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
