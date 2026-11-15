'use client'

// Photo backdrop for the landing hero: a slow crossfade between real workers.
//
// Loading is the point of this file. Only the current photo and the next one are ever in
// the page, each at the size it is shown (srcset), so a phone on mobile data downloads
// one ~60 KB image to see the hero, not sixteen full-size originals. Until a photo has
// loaded, a brand-tinted backdrop shows instead of a black box, and the text on top never
// waits for it.
import { useEffect, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { useReducedMotion } from 'framer-motion'
import { cldSized, cldSrcSet } from '@/lib/cloudinary'

const SLIDES = [
    { id: 'barberman', caption: 'Barbers' },
    { id: 'plumberman', caption: 'Plumbers' },
    { id: 'tailorgirl', caption: 'Tailors' },
    { id: 'electricianman', caption: 'Electricians' },
    { id: 'braidergirl', caption: 'Hair braiders' },
    { id: 'carpenterman', caption: 'Carpenters' },
    { id: 'cheflady', caption: 'Cooks and caterers' },
    { id: 'mechanicman', caption: 'Mechanics' },
]

const INTERVAL_MS = 7000
const FADE_MS = 1200
// The hero is full width on phones and half width from the lg breakpoint
const SIZES = '(min-width: 1024px) 50vw, 100vw'

/** Position it from outside, e.g. className="absolute inset-0 -z-10" (it fills its box). */
export function HeroSlideshow({ className = 'relative' }: { className?: string }) {
    // Ask for the first photo from the page <head>, alongside the scripts, not after them
    preload(cldSized(SLIDES[0].id, 1080), {
        as: 'image', fetchPriority: 'high', imageSrcSet: cldSrcSet(SLIDES[0].id), imageSizes: SIZES,
    })
    const reduce = useReducedMotion()
    const [idx, setIdx] = useState(0)
    const [prev, setPrev] = useState<number | null>(null) // stays underneath while the new one fades in
    const [loaded, setLoaded] = useState<Record<number, boolean>>({})
    const [hidden, setHidden] = useState(false)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const next = (idx + 1) % SLIDES.length

    // Pause while the tab is in the background: no point fetching photos nobody sees
    useEffect(() => {
        const onVis = () => setHidden(document.hidden)
        document.addEventListener('visibilitychange', onVis)
        return () => document.removeEventListener('visibilitychange', onVis)
    }, [])

    // Advance only once the next photo is ready, so a slow network never fades to nothing
    useEffect(() => {
        if (reduce || hidden || !loaded[next]) return
        timer.current = setTimeout(() => { setPrev(idx); setIdx(next) }, INTERVAL_MS)
        return () => { if (timer.current) clearTimeout(timer.current) }
    }, [idx, next, loaded, reduce, hidden])

    // Once the fade has finished, the previous photo can leave the page
    useEffect(() => {
        if (prev === null) return
        const t = setTimeout(() => setPrev(null), FADE_MS + 100)
        return () => clearTimeout(t)
    }, [prev])

    const markLoaded = (i: number) => setLoaded(l => (l[i] ? l : { ...l, [i]: true }))

    return (
        <div className={`overflow-hidden bg-[radial-gradient(120%_80%_at_70%_20%,#1f5c45_0%,#10261d_55%,#0b1712_100%)] ${className}`}>
            {/* Only the previous (fading out under), current and next (preloading) slides are rendered */}
            {SLIDES.map((s, i) => {
                if (i !== idx && i !== next && i !== prev) return null
                const show = (i === idx && loaded[i]) || i === prev
                return (
                    <img
                        key={s.id}
                        src={cldSized(s.id, 1080)}
                        srcSet={cldSrcSet(s.id)}
                        sizes={SIZES}
                        alt=""
                        aria-hidden="true"
                        decoding="async"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        fetchPriority={i === 0 ? 'high' : 'low'}
                        onLoad={() => markLoaded(i)}
                        // The first photo is in the server HTML and can finish loading before
                        // React attaches onLoad, so also check when React picks it up
                        ref={el => { if (el?.complete && el.naturalWidth > 0) markLoaded(i) }}
                        className="absolute inset-0 h-full w-full object-cover object-[center_25%] transition-opacity ease-in-out"
                        style={{ opacity: show ? 1 : 0, zIndex: i === idx ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
                    />
                )
            })}

            {/* Scrims: keep the text readable whichever photo is showing */}
            <div aria-hidden="true" className="absolute inset-0 z-[2] bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
            <div aria-hidden="true" className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Which trade is showing: decorative, so hidden from screen readers */}
            <p aria-hidden="true"
                className="absolute bottom-6 right-6 z-[3] rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm transition-opacity duration-500"
                style={{ opacity: loaded[idx] ? 1 : 0 }}>
                {SLIDES[idx].caption}
            </p>
        </div>
    )
}
