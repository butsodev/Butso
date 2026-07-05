'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { IMAGES } from '@/lib/cloudinary'

// Only the best worker shots for the hero — action/portrait images
// busyafricanstreet is saved for the bottom CTA section
const SLIDES = [
    { src: IMAGES.barberman, caption: 'Barbers', accent: '#1B9E6E' },
    { src: IMAGES.plumberman, caption: 'Plumbers', accent: '#3B82F6' },
    { src: IMAGES.electricianman, caption: 'Electricians', accent: '#F59E0B' },
    { src: IMAGES.cleanerwoman, caption: 'Cleaners', accent: '#EC4899' },
    { src: IMAGES.carpenterman, caption: 'Carpenters', accent: '#D97706' },
    { src: IMAGES.painterman, caption: 'Painters', accent: '#8B5CF6' },
    { src: IMAGES.tailorgirl, caption: 'Tailors', accent: '#F55D1E' },
    { src: IMAGES.cheflady, caption: 'Cooks & chefs', accent: '#EF4444' },
    { src: IMAGES.mechanicman, caption: 'Mechanics', accent: '#6366F1' },
    { src: IMAGES.bricklayer, caption: 'Bricklayers', accent: '#F55D1E' },
    { src: IMAGES.securityman, caption: 'Security', accent: '#0EA5E9' },
    { src: IMAGES.braidergirl, caption: 'Hair braiders', accent: '#EC4899' },
    { src: IMAGES.laundryladies, caption: 'Laundry services', accent: '#14B8A6' },
    { src: IMAGES.farmerwoman, caption: 'Farm work', accent: '#10B981' },
    { src: IMAGES.constructionworkerpointing, caption: 'Builders', accent: '#F55D1E' },
    { src: IMAGES.workershandshake, caption: 'Get connected', accent: '#1B9E6E' },
]

const INTERVAL = 9000   // 9s per slide — slower, more time to register each worker
const TRANS_DUR = 2      // 2s crossfade — noticeably smoother, less jarring
const ZOOM_SCALE = 1.05   // very subtle Ken Burns — barely perceptible

export function HeroSlideshow({ style, className }: { style?: React.CSSProperties; className?: string }) {
    const [idx, setIdx] = useState(0)
    const [paused, setPaused] = useState(false)
    const timer = useRef<ReturnType<typeof setInterval> | null>(null)

    const startTimer = () => {
        if (timer.current) clearInterval(timer.current)
        timer.current = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), INTERVAL)
    }

    useEffect(() => {
        startTimer()
        return () => { if (timer.current) clearInterval(timer.current) }
    }, [])

    const goTo = (i: number) => {
        setIdx(i)
        startTimer() // reset interval so it doesn't jump immediately after manual nav
    }

    return (
        <div
            style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0a1a12', ...style }}
            className={className}
            onMouseEnter={() => { setPaused(true); if (timer.current) clearInterval(timer.current) }}
            onMouseLeave={() => { setPaused(false); startTimer() }}
        >

            {/* ── SLIDES — crossfade stack ──────────────────────── */}
            {SLIDES.map((slide, i) => (
                <motion.div
                    key={slide.src}
                    animate={{ opacity: i === idx ? 1 : 0 }}
                    transition={{ duration: TRANS_DUR, ease: 'easeInOut' }}
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                >
                    {/* Ken Burns — only animate the active slide */}
                    <motion.img
                        src={slide.src}
                        alt={slide.caption}
                        key={`img-${i}-${i === idx ? 'active' : 'idle'}`}
                        initial={{ scale: i === idx ? 1 : ZOOM_SCALE }}
                        animate={{ scale: i === idx ? ZOOM_SCALE : ZOOM_SCALE }}
                        transition={i === idx ? { duration: INTERVAL / 1000 + TRANS_DUR, ease: 'linear' } : { duration: 0 }}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        fetchPriority={i === 0 ? 'high' : 'low'}
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'center top',
                            display: 'block',
                        }}
                    />
                </motion.div>
            ))}

            {/* ── GRADIENT overlays — always on top of images ─────── */}
            {/* Dark vignette left — for hero text readability */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(to right, rgba(8,8,8,0.80) 0%, rgba(8,8,8,0.45) 45%, rgba(8,8,8,0.15) 100%)',
            }} />
            {/* Bottom fade — for dots/caption area */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(to top, rgba(8,8,8,0.70) 0%, transparent 35%)',
            }} />

            {/* ── CAPTION — fades with slide ───────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`cap-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'absolute', bottom: '3.5rem', left: '1.5rem',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                        background: SLIDES[idx].accent + 'bb',
                        backdropFilter: 'blur(10px)',
                        padding: '0.28rem 0.7rem',
                        borderRadius: 99,
                    }}
                >
                    {SLIDES[idx].caption}
                </motion.div>
            </AnimatePresence>

            {/* ── PROGRESS BAR — thin, top edge ────────────────────── */}
            <AnimatePresence>
                {!paused && (
                    <motion.div
                        key={`prog-${idx}`}
                        style={{
                            position: 'absolute', top: 0, left: 0, height: 2,
                            background: SLIDES[idx].accent,
                            transformOrigin: 'left',
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                    />
                )}
            </AnimatePresence>

            {/* ── DOT INDICATORS — bottom center ───────────────────── */}
            <div style={{
                position: 'absolute', bottom: '1rem', left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: 5,
            }}>
                {SLIDES.map((slide, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        style={{
                            width: i === idx ? 18 : 5, height: 5,
                            borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
                            background: i === idx ? SLIDES[idx].accent : 'rgba(255,255,255,0.25)',
                            transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1), background 0.4s',
                        }}
                    />
                ))}
            </div>

        </div>
    )
}