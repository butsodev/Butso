'use client'

import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { imgUrl } from '@/lib/upload'

export interface ViewerPhoto { id: string; imageUrl: string; caption?: string }

/** Full-screen photo viewer: swipe or use the arrows, with a share button on every photo. */
export function PhotoViewer({ photos, startIndex, title, onClose, onShare }: {
  photos: ViewerPhoto[]
  startIndex: number
  title: string
  onClose: () => void
  onShare: (photo: ViewerPhoto) => void
}) {
  const [i, setI] = useState(Math.min(Math.max(startIndex, 0), photos.length - 1))
  const touchX = useRef<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const last = photos.length - 1
  const go = (d: number) => setI(n => Math.min(Math.max(n + d, 0), last))

  useEffect(() => {
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI(n => Math.min(n + 1, last))
      if (e.key === 'ArrowLeft') setI(n => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow }
  }, [onClose, last])

  const p = photos[i]
  if (!p) return null
  const next = photos[i + 1]

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label={`${title} photos`}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}>
      <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 text-white">
        <button ref={closeRef} aria-label="Close photos" onClick={onClose} className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"><X size={20} /></button>
        <span className="text-sm font-bold">{i + 1} / {photos.length}</span>
        <button aria-label="Share this photo" onClick={() => onShare(p)} className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"><Share2 size={18} /></button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={p.id} src={imgUrl(p.imageUrl, 'f_auto,q_auto,w_1400')} alt={p.caption || title} className="max-w-full max-h-full object-contain select-none" draggable={false} />
        {i > 0 && (
          <button aria-label="Previous photo" onClick={() => go(-1)} className="hidden sm:flex absolute left-3 w-11 h-11 rounded-full bg-white/15 text-white items-center justify-center"><ChevronLeft size={22} /></button>
        )}
        {i < last && (
          <button aria-label="Next photo" onClick={() => go(1)} className="hidden sm:flex absolute right-3 w-11 h-11 rounded-full bg-white/15 text-white items-center justify-center"><ChevronRight size={22} /></button>
        )}
        {/* load the next photo quietly so swiping feels instant */}
        {next && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl(next.imageUrl, 'f_auto,q_auto,w_1400')} alt="" className="hidden" />
        )}
      </div>

      <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-white min-h-[4.5rem]">
        {p.caption && <p className="text-sm">{p.caption}</p>}
        <p className="text-xs text-white/60 mt-1">{title}</p>
      </div>
    </div>
  )
}
