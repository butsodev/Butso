'use client'

// App-wide extras, mounted once in the layout:
//  1. Confirm dialog (replaces window.confirm)
//  2. Hover labels on desktop, long-press labels on touch, for icon-only buttons
//  3. "You are offline" banner
//  4. Hides the broken-image icon when a picture fails to load
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useConfirmStore, answerConfirm } from '@/lib/confirm'
import { useFocusTrap } from '@/lib/useFocusTrap'

function ConfirmHost() {
  const { open, opts } = useConfirmStore()
  const panel = useRef<HTMLDivElement>(null)
  useFocusTrap(panel, open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') answerConfirm(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <AnimatePresence>
      {open && opts && (
        <motion.div key="confirm" className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          onClick={() => answerConfirm(false)}>
          <motion.div ref={panel} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
            className="w-full max-w-sm bg-card text-card-foreground rounded-2xl p-5 shadow-xl border border-border"
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18 }}
            onClick={e => e.stopPropagation()}>
            <h2 id="confirm-title" className="text-lg font-black text-foreground">{opts.title}</h2>
            {opts.message && <p className="text-sm text-muted-foreground mt-1.5">{opts.message}</p>}
            <div className="flex gap-2 mt-5">
              <button autoFocus onClick={() => answerConfirm(false)}
                className="flex-1 min-h-[46px] rounded-xl border border-border font-bold text-sm text-foreground">
                {opts.cancelLabel ?? 'Cancel'}
              </button>
              <button onClick={() => answerConfirm(true)}
                className={`flex-1 min-h-[46px] rounded-xl font-bold text-sm ${opts.danger ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground'}`}>
                {opts.confirmLabel ?? 'OK'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface TipState { label: string; x: number; y: number; above: boolean }

function TipHost() {
  const [tip, setTip] = useState<TipState | null>(null)

  useEffect(() => {
    let showTimer: number | undefined
    let hideTimer: number | undefined
    let current: Element | null = null
    let suppressClickUntil = 0
    let startX = 0
    let startY = 0

    // Icon-only buttons and links (no visible text) get a label; anything can opt in with data-tip
    const targetOf = (n: EventTarget | null) => {
      const el = (n as Element | null)?.closest?.('[data-tip], button[aria-label], a[aria-label]') as HTMLElement | null
      if (!el) return null
      const optedIn = el.hasAttribute('data-tip')
      const label = el.getAttribute('data-tip') || el.getAttribute('aria-label') || ''
      if (!label) return null
      if (!optedIn && (el.textContent ?? '').trim()) return null
      return { el, label }
    }
    const show = (el: HTMLElement, label: string) => {
      const r = el.getBoundingClientRect()
      const x = Math.min(Math.max(r.left + r.width / 2, 72), window.innerWidth - 72)
      const above = r.top > 64
      setTip({ label, x, y: above ? r.top - 8 : r.bottom + 8, above })
    }
    const hide = () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
      current = null
      setTip(null)
    }

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const t = targetOf(e.target)
      if (!t) { if (current) hide(); return }
      if (t.el === current) return
      hide()
      current = t.el
      showTimer = window.setTimeout(() => show(t.el, t.label), 450)
    }
    const onOut = (e: PointerEvent) => { if (e.pointerType === 'mouse') hide() }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') { hide(); return }
      const t = targetOf(e.target)
      if (!t) return
      hide()
      current = t.el
      startX = e.clientX
      startY = e.clientY
      showTimer = window.setTimeout(() => {
        show(t.el, t.label)
        suppressClickUntil = Date.now() + 800 // the finger lift after a long press must not press the button
        hideTimer = window.setTimeout(hide, 2200)
      }, 450)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || !current) return
      if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) window.clearTimeout(showTimer)
    }
    const onUp = (e: PointerEvent) => { if (e.pointerType !== 'mouse') window.clearTimeout(showTimer) }
    const onClick = (e: MouseEvent) => {
      if (Date.now() < suppressClickUntil) { e.preventDefault(); e.stopPropagation(); suppressClickUntil = 0 }
    }
    const onContext = (e: Event) => { if (Date.now() < suppressClickUntil + 1500 && targetOf(e.target)) e.preventDefault() }
    const onFocus = (e: FocusEvent) => {
      const t = targetOf(e.target)
      if (!t || !t.el.matches(':focus-visible')) return
      hide()
      current = t.el
      show(t.el, t.label)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide() }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)
    document.addEventListener('click', onClick, true)
    document.addEventListener('contextmenu', onContext)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', hide)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', hide, true)
    return () => {
      hide()
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', hide)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', hide, true)
    }
  }, [])

  return (
    <AnimatePresence>
      {tip && (
        <motion.div key={tip.label + tip.x} role="tooltip" aria-hidden="true"
          className="pointer-events-none fixed z-[200] max-w-[220px] px-2.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold shadow-lg"
          style={{ left: tip.x, top: tip.y, translateX: '-50%', translateY: tip.above ? '-100%' : '0%' }}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
          {tip.label}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function OfflineBanner() {
  const [online, setOnline] = useState(true)
  const [justBack, setJustBack] = useState(false)

  useEffect(() => {
    setOnline(navigator.onLine)
    let t: number | undefined
    const on = () => { setOnline(true); setJustBack(true); t = window.setTimeout(() => setJustBack(false), 2500) }
    const off = () => { window.clearTimeout(t); setJustBack(false); setOnline(false) }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); window.clearTimeout(t) }
  }, [])

  const show = !online || justBack
  return (
    <AnimatePresence>
      {show && (
        <motion.div key={online ? 'back' : 'off'} role="status"
          className={`fixed inset-x-0 top-0 z-[150] flex items-center justify-center gap-2 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-xs font-bold ${online ? 'bg-green-600 text-white' : 'bg-foreground text-background'}`}
          initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.2 }}>
          {online ? 'Back online' : (<><WifiOff size={14} /> You are offline. Some things will not load.</>)}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function GlobalUI() {
  // A picture that fails to load (slow or dropped network) should not show a broken-image icon
  useEffect(() => {
    const onError = (e: Event) => {
      const t = e.target
      if (t instanceof HTMLImageElement) t.style.visibility = 'hidden'
    }
    const onLoad = (e: Event) => {
      const t = e.target
      if (t instanceof HTMLImageElement && t.style.visibility === 'hidden') t.style.visibility = ''
    }
    document.addEventListener('error', onError, true)
    document.addEventListener('load', onLoad, true)
    return () => { document.removeEventListener('error', onError, true); document.removeEventListener('load', onLoad, true) }
  }, [])

  return (
    <>
      <ConfirmHost />
      <TipHost />
      <OfflineBanner />
    </>
  )
}
