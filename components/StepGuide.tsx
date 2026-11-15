'use client'

// Step-by-step walkthrough in a pop-up. Plays like a short video (autoplay with a progress bar,
// tap the screen to pause, swipe to move) but is pure text and CSS: a few KB, works on slow data.
// A guide can also carry a real screen recording (guide.video), offered as "Watch video".
// Loaded only when someone opens a guide or the welcome tour, so it never slows the rest of the app.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { X, ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Film, ListOrdered } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { Guide } from '@/lib/guideContent'

const AUTOPLAY_MS = 7000 // slow on purpose: long enough to read a step twice
const SWIPE_PX = 50

export type StepGuideProps = {
  guide: Guide
  /** Called however the guide ends. "done" = reached the end, "skipped" = closed early. */
  onClose: (how: 'done' | 'skipped') => void
  /** Open at this step (0-based), e.g. the step that matched a search. */
  startAt?: number
  /** Start playing on open (ignored when the person prefers reduced motion). */
  autoPlay?: boolean
  /** "tour" adds a clear Skip button and hides "Try it now". */
  variant?: 'guide' | 'tour'
}

export default function StepGuide({ guide, onClose, startAt = 0, autoPlay = false, variant = 'guide' }: StepGuideProps) {
  const reduce = useReducedMotion()
  const last = guide.steps.length - 1
  const [i, setI] = useState(() => Math.min(Math.max(startAt, 0), last))
  const [playing, setPlaying] = useState(autoPlay && !reduce)
  const [mode, setMode] = useState<'steps' | 'video'>('steps')
  const step = guide.steps[i]
  const isTour = variant === 'tour'
  const action = !isTour ? guide.action : undefined

  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const swipeX = useRef<number | null>(null)
  const swiped = useRef(false) // a swipe also fires a click: ignore that one
  useFocusTrap(panelRef)

  const skip = () => onClose('skipped')
  const finish = () => onClose('done')
  const next = () => setI(n => Math.min(n + 1, last))
  const prev = () => setI(n => Math.max(n - 1, 0))

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose('skipped')
      if (e.key === 'ArrowRight') setI(n => Math.min(n + 1, last))
      if (e.key === 'ArrowLeft') setI(n => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, last])

  useEffect(() => {
    if (!playing || mode !== 'steps') return
    if (i >= last) { setPlaying(false); return }
    const t = setTimeout(() => setI(n => n + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [playing, i, last, mode])

  const tryIt = () => {
    if (!action) return
    finish()
    useAppStore.getState().setCurrentPage(action.page)
  }

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      role="dialog" aria-modal="true" aria-label={guide.title} onClick={skip}>
      <motion.div ref={panelRef} initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ duration: 0.22 }}
        className="w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wide">{guide.forWho}</p>
            <h2 className="text-lg font-black text-foreground">{guide.title}</h2>
          </div>
          {isTour ? (
            <button ref={closeRef} onClick={skip}
              className="shrink-0 min-h-[40px] px-4 rounded-full bg-secondary text-sm font-bold text-foreground">
              Skip
            </button>
          ) : (
            <button ref={closeRef} aria-label="Close guide" onClick={skip}
              className="shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <X size={18} />
            </button>
          )}
        </div>

        {guide.video && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-xl mb-4" role="tablist" aria-label="How to view this guide">
            {([['steps', 'Step by step', ListOrdered], ['video', 'Watch video', Film]] as const).map(([m, label, Icon]) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setPlaying(false) }}
                className={`min-h-[40px] rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition ${mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                <Icon size={15} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        )}

        {mode === 'video' && guide.video ? (
          <video className="w-full rounded-2xl bg-black aspect-[9/16] max-h-[60vh] mx-auto mb-4" controls playsInline preload="metadata"
            poster={guide.video.poster} aria-label={`${guide.title} video`}>
            <source src={guide.video.src} type="video/mp4" />
            {guide.video.captions && <track kind="captions" src={guide.video.captions} srcLang="en" label="English" default />}
            Your browser cannot play this video. Use Step by step instead.
          </video>
        ) : (
          <>
            {/* A simple picture of the screen. Tap it to pause or play, swipe it to move between steps. */}
            <button type="button" aria-label={playing ? 'Pause' : 'Play'}
              onClick={() => { if (swiped.current) { swiped.current = false; return } setPlaying(p => !p) }}
              onPointerDown={e => { swipeX.current = e.clientX; swiped.current = false }}
              onPointerUp={e => {
                const start = swipeX.current
                swipeX.current = null
                if (start === null) return
                const dx = e.clientX - start
                if (Math.abs(dx) > SWIPE_PX) { swiped.current = true; if (dx < 0) next(); else prev() }
              }}
              onPointerCancel={() => { swipeX.current = null }}
              className="relative block mx-auto w-52 rounded-[1.6rem] border-4 border-foreground/80 bg-card overflow-hidden mb-3 touch-pan-y select-none text-left">
              <AnimatePresence mode="wait">
                <motion.div key={i} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.25 }} aria-hidden="true">
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
              {/* Autoplay progress, like a video's: fills while this step is showing */}
              <div className="absolute left-0 right-0 bottom-0 h-1 bg-border/60" aria-hidden="true">
                {playing && (
                  <motion.div key={`bar-${i}`} className="h-full bg-primary origin-left"
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }} />
                )}
              </div>
            </button>

            <p className="text-xs font-bold text-muted-foreground text-center mb-1">Step {i + 1} of {guide.steps.length}</p>
            <p className="text-base text-foreground text-center leading-relaxed min-h-[5.5rem]" aria-live="polite">{step.text}</p>

            {/* Step dots: tap one to jump to it */}
            <div className="flex justify-center gap-1 my-3">
              {guide.steps.map((_, n) => (
                <button key={n} type="button" onClick={() => setI(n)} aria-label={`Go to step ${n + 1}`} aria-current={n === i ? 'step' : undefined}
                  className="h-6 px-0.5 flex items-center">
                  <span className={`block h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`} />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          {mode === 'steps' && (
            <>
              <button onClick={prev} disabled={i === 0} aria-label="Previous step"
                className="min-h-[48px] px-4 rounded-xl border border-border font-bold text-sm flex items-center gap-1 disabled:opacity-40">
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause autoplay' : 'Play automatically'}
                className="min-h-[48px] w-12 rounded-xl border border-border flex items-center justify-center">
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </>
          )}
          {mode === 'steps' && i < last ? (
            <button onClick={next}
              className="flex-1 min-h-[48px] rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-1">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={finish} className="flex-1 min-h-[48px] rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              {isTour ? 'Start using Butsó' : 'Done'}
            </button>
          )}
        </div>

        {action && (mode === 'video' || i === last) && (
          <button onClick={tryIt}
            className="w-full mt-2 min-h-[48px] rounded-xl border-2 border-primary/40 text-primary font-bold text-sm flex items-center justify-center gap-1.5">
            Try it now: {action.label} <ArrowRight size={16} />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
