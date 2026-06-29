'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Star, ChevronRight, MapPin, ArrowRight, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { HeroSlideshow } from '@/components/HeroSlideshow'

// ─── MEDIA SLOTS ──────────────────────────────────────────────────────────────
// Drop files in /public/ — paths below wire up automatically.
// Everything shows a clean placeholder until real media arrives.
const MEDIA = {
  // ── All images already in /public/ ───────────────────────────────
  // Hero slideshow handled by HeroSlideshow component (uses same images)

  // Worker avatars — using your real worker images as stand-ins
  // Replace with actual headshots when you have them
  workers: [
    '/plumberman.png',       // Wunuken Danladi — Plumber
    '/cleanerwoman.png',     // Fatima Abdullahi — Cleaner
    '/electricianman.png',   // Zando Ishaku — Electrician
    '/barberman.png',        // Emeka Eze — Carpenter (closest available)
    '/constructionworkerpointing.png', // Wapuken Amos — Painter
    '/farmerwoman.png',      // Yusuf Garba — Welder (closest available)
  ],

  // Feature carousel slides (LinkedIn-style, text left + image right)
  slideWorkerPhone: '/mancalling.png',         // "Direct contact" slide
  slideHandshake: '/workershandshake.png',   // "Get hired" slide
  slideShop: '/barberman.png',          // "Book a shop" slide

  // Two-column tiles
  tileHire: '/constructionworkerpointing.png', // "Find a worker" tile
  tileWork: '/plumberman.png',                 // "Offer your skills" tile

  // "Who is Butsó for?" section — tall portrait
  whoFor: '/constructionworkerpointing.png',

  // Bottom CTA section — wide scene behind text
  bottomBg: '/busyafricanstreet.png',

  // Success story section
  successStory: '/workershandshake.png',
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TICKER = [
  '🔧 Plumber needed · Wukari GRA · ₦8,000',
  '⚡ Electrician · 3-day job · ₦15,000',
  '🧹 Office cleaner · Weekly · ₦5,000',
  '🏗️ Carpenter needed · Furniture build',
  '🎨 House painter · 4 rooms · ₦20,000',
  '🌿 Gardener · Monthly · ₦6,000',
  '🍳 Event cook · Saturday · ₦12,000',
  '🚗 Driver · School run · Daily',
  '🛠️ Welder · Gate repair · North Wukari',
  '👷 Bricklayer · Extension job · Urgent',
]

const WORKERS = [
  { name: 'Wunuken Danladi', skill: 'Plumber', rating: 4.9, jobs: 34, location: 'Central Wukari', available: true, rate: '₦3,500/hr', initials: 'WD', color: '#1B9E6E' },
  { name: 'Fatima Abdullahi', skill: 'Cleaner', rating: 4.8, jobs: 62, location: 'North Wukari', available: true, rate: '₦2,000/hr', initials: 'FA', color: '#F55D1E' },
  { name: 'Zando Ishaku', skill: 'Electrician', rating: 4.7, jobs: 28, location: 'South Wukari', available: false, rate: '₦4,000/hr', initials: 'ZI', color: '#8B5CF6' },
  { name: 'Emeka Eze', skill: 'Carpenter', rating: 4.6, jobs: 19, location: 'Central Wukari', available: true, rate: '₦3,000/hr', initials: 'EE', color: '#F59E0B' },
  { name: 'Wapuken Amos', skill: 'Painter', rating: 4.9, jobs: 47, location: 'North Wukari', available: true, rate: '₦3,800/hr', initials: 'WA', color: '#EC4899' },
  { name: 'Yusuf Garba', skill: 'Welder', rating: 4.5, jobs: 23, location: 'South Wukari', available: true, rate: '₦4,500/hr', initials: 'YG', color: '#06B6D4' },
]

const LIVE_JOBS = [
  { title: 'Plumbing Repair', location: 'Central Wukari', budget: '₦8,000', ago: '2h ago', applicants: 2 },
  { title: 'House Cleaning', location: 'South Wukari', budget: '₦5,000', ago: '1h ago', applicants: 0 },
  { title: 'Electrical Wiring', location: 'North Wukari', budget: '₦15,000', ago: '3h ago', applicants: 5 },
  { title: 'Fence Painting', location: 'North Wukari', budget: '₦12,000', ago: '30m ago', applicants: 1 },
  { title: 'Generator Repair', location: 'Central Wukari', budget: '₦6,000', ago: '5h ago', applicants: 3 },
]

const CATEGORIES = [
  { emoji: '🔧', label: 'Plumbing', workers: 48 },
  { emoji: '⚡', label: 'Electrical', workers: 32 },
  { emoji: '🪵', label: 'Carpentry', workers: 27 },
  { emoji: '🧹', label: 'Cleaning', workers: 91 },
  { emoji: '🎨', label: 'Painting', workers: 35 },
  { emoji: '🍳', label: 'Cooking', workers: 22 },
  { emoji: '🚗', label: 'Driving', workers: 18 },
  { emoji: '🧵', label: 'Tailoring', workers: 14 },
  { emoji: '🏗️', label: 'Construction', workers: 56 },
  { emoji: '🌿', label: 'Gardening', workers: 11 },
]

// LinkedIn-style carousel slides: text left, circle-cropped image right
const SLIDES = [
  {
    tag: 'For employers',
    headline: 'Let workers know you have a job',
    body: 'Post any job in under 2 minutes. Plumbing, cleaning, carpentry — whatever you need. Workers near you apply instantly.',
    cta: 'Post a job',
    img: MEDIA.slideWorkerPhone,
    emoji: '📱',
    situation: 'need-done' as const,
  },
  {
    tag: 'For everyone',
    headline: 'Direct messages, no middleman',
    body: 'Chat directly with workers or employers. Agree a price, confirm the job, get it done. No agency taking a cut.',
    cta: 'Start messaging',
    img: MEDIA.slideHandshake,
    emoji: '💬',
    situation: 'exploring' as const,
  },
  {
    tag: 'Book services',
    headline: 'Book a shop slot instantly',
    body: 'Barbers, tailors, mechanics — browse their open slots and book straight from the app. No calls, no waiting.',
    cta: 'Browse shops',
    img: MEDIA.slideShop,
    emoji: '🏪',
    situation: 'exploring' as const,
  },
]

// "Who is Butsó for?" — LinkedIn's chevron list
const WHO_FOR = [
  { icon: '🛠️', label: 'Find work near you', situation: 'have-skill' as const },
  { icon: '📋', label: 'Hire someone for a job', situation: 'need-done' as const },
  { icon: '🏪', label: 'Book a shop or service', situation: 'exploring' as const },
  { icon: '👀', label: 'Browse what\'s available', situation: 'exploring' as const },
]

type Situation = 'need-done' | 'have-skill' | 'exploring'

// ─── SMART IMAGE — shows placeholder when file isn't there yet ─────────────
function Img({ src, alt, emoji, label, style, className }: {
  src: string; alt: string; emoji: string; label: string
  style?: React.CSSProperties; className?: string
}) {
  const [err, setErr] = useState(false)
  if (err) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8, background: 'rgba(27,158,110,0.07)', border: '1.5px dashed rgba(27,158,110,0.25)',
      borderRadius: 12, padding: '1rem', textAlign: 'center', color: '#1B9E6E', ...style,
    }} className={className}>
      <span style={{ fontSize: '2rem' }}>{emoji}</span>
      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>{label}</span>
    </div>
  )
  return <img src={src} alt={alt} style={style} className={className} onError={() => setErr(true)} />
}

// ─── WORKER AVATAR — image with initials fallback (Upwork-style) ─────────
function WorkerAvatar({ worker, index, size = 40 }: { worker: typeof WORKERS[0]; index: number; size?: number }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', flexShrink: 0 }}>
      {!imgErr && (
        <img
          src={MEDIA.workers[index]}
          alt={worker.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', position: 'absolute', inset: 0 }}
          onError={() => setImgErr(true)}
        />
      )}
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: worker.color + '28', border: `2px solid ${worker.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.28, fontWeight: 800, color: worker.color,
        visibility: imgErr ? 'visible' : 'hidden',
      }}>
        {worker.initials}
      </div>
      {/* Available dot */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: size * 0.28, height: size * 0.28, borderRadius: '50%',
        background: worker.available ? '#1B9E6E' : '#888',
        border: `${size * 0.05}px solid var(--bg-canvas, #111110)`,
      }} />
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function LandingPage() {
  const { setCurrentPage, darkMode, toggleDarkMode } = useAppStore()
  const [tickerPaused, setTickerPaused] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-advance carousel (LinkedIn pattern)
  useEffect(() => {
    slideTimer.current = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => { if (slideTimer.current) clearInterval(slideTimer.current) }
  }, [])

  const go = (situation: Situation) => {
    sessionStorage.setItem('selectedSituation', situation)
    if (situation === 'exploring') {
      setCurrentPage('explore-onboarding')
    } else {
      sessionStorage.setItem('selectedRole', situation === 'need-done' ? 'employer' : 'worker')
      setCurrentPage('auth')
    }
  }

  // Palette — dark like the app itself, Butsó's own identity
  const C = {
    canvas: '#111110',
    surface: '#161614',
    card: '#1C1C1A',
    border: 'rgba(255,255,255,0.07)',
    text: '#F0EFEB',
    mid: '#C0BFB8',
    muted: '#8A8980',
    faint: '#3A3A36',
    green: '#1B9E6E',
    orange: '#F55D1E',
    greenBg: 'rgba(27,158,110,0.12)',
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.canvas, color: C.text, fontFamily: 'var(--font-sans), system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(17,17,16,0.92)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 1.5rem', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: C.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>B</span>
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.18rem', letterSpacing: '-0.03em' }}>Butsó</span>
          </div>

          {/* Nav links — LinkedIn style, desktop only */}
          <nav style={{ display: 'flex', gap: 4 }} className="ld-nav">
            {[
              { label: 'Browse Jobs', s: 'have-skill' as Situation },
              { label: 'Find Workers', s: 'need-done' as Situation },
              { label: 'Book a Service', s: 'exploring' as Situation },
            ].map(item => (
              <button key={item.label} onClick={() => go(item.s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.82rem', color: C.muted, fontWeight: 600, borderBottom: '2px solid transparent', transition: 'color 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.text; el.style.borderBottomColor = C.green }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.muted; el.style.borderBottomColor = 'transparent' }}
              >{item.label}</button>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: C.faint, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, padding: '0.25rem 0.65rem', borderRadius: 99, flexShrink: 0 }} className="ld-location">
              <MapPin size={9} style={{ color: C.green }} />Wukari
            </div>
            <button onClick={toggleDarkMode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '0.4rem', borderRadius: 6, fontSize: '0.9rem' }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setCurrentPage('auth')}
              style={{ background: 'none', border: `1px solid rgba(255,255,255,0.14)`, borderRadius: 8, padding: '0.42rem 1rem', fontSize: '0.82rem', color: C.mid, fontWeight: 600, cursor: 'pointer' }}>
              Sign in
            </button>
            <button onClick={() => go('have-skill')}
              style={{ background: C.green, border: 'none', borderRadius: 8, padding: '0.42rem 1rem', fontSize: '0.82rem', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Join free
            </button>
          </div>
        </div>
      </header>

      {/* ── TICKER ──────────────────────────────────────────────────────── */}
      <div style={{ background: C.green, overflow: 'hidden', padding: '0.36rem 0' }}
        onMouseEnter={() => setTickerPaused(true)} onMouseLeave={() => setTickerPaused(false)}>
        <div style={{ display: 'flex', width: 'max-content', animation: tickerPaused ? 'none' : 'ld-ticker 32s linear infinite' }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap', fontSize: '0.67rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', padding: '0 2.5rem' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── HERO — Fiverr video left + LinkedIn live-content right ───── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 96px)', overflow: 'hidden' }} className="ld-hero-grid">

        {/* LEFT — animated image slideshow */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: 520 }}>

          {/* Slideshow sits behind the text overlay */}
          <HeroSlideshow style={{ position: 'absolute', inset: 0 }} />

          {/* Hero text overlay */}
          <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(2rem,5vw,3.5rem) clamp(1.5rem,4vw,3rem)' }}>

            {/* Eyebrow */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', fontWeight: 700, color: C.green, background: C.greenBg, border: `1px solid rgba(27,158,110,0.25)`, padding: '0.25rem 0.8rem', borderRadius: 99, marginBottom: '1.25rem' }}>
                🇳🇬 "Butsó" means work in Jukun · Built for Wukari
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(1.9rem,3.8vw,3rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.035em', marginBottom: '1rem', maxWidth: 460 }}
            >
              Skilled workers.<br />
              <span style={{ color: C.green }}>Real jobs.</span><br />
              Right here in Wukari.
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '0.92rem', color: 'rgba(240,239,235,0.62)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 380 }}
            >
              Find a plumber, book a barber, hire a cleaner — or list your own skills and get hired. No agency. No CV. No wahala.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button onClick={() => go('need-done')}
                style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '0.82rem 1.5rem', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(27,158,110,0.35)', display: 'flex', alignItems: 'center', gap: 7 }}>
                Hire someone <ArrowRight size={14} />
              </button>
              <button onClick={() => go('have-skill')}
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: C.text, border: `1px solid rgba(255,255,255,0.14)`, borderRadius: 10, padding: '0.82rem 1.5rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                Find work →
              </button>
            </motion.div>

            {/* Upwork-style social proof avatars */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex' }}>
                {WORKERS.slice(0, 5).map((w, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: w.color, border: '2px solid #111110', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.52rem', fontWeight: 800, color: '#fff', marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }}>
                    {w.initials}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(240,239,235,0.5)' }}>
                <strong style={{ color: C.mid }}>500+ workers</strong> · Free to join
              </span>
            </motion.div>
          </div>
        </div>

        {/* RIGHT — LinkedIn live-content panel */}
        <div style={{ background: C.surface, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', maxHeight: 'calc(100vh - 96px)', padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="ld-right-panel">

          {/* Workers near you */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.text }}>Workers near you</p>
              <button onClick={() => go('exploring')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: C.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                See all <ChevronRight size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {WORKERS.map((w, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => go('exploring')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#222220'; el.style.borderColor = 'rgba(27,158,110,0.3)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.card; el.style.borderColor = C.border }}
                >
                  <WorkerAvatar worker={w} index={i} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
                      {w.available && <span style={{ fontSize: '0.58rem', fontWeight: 700, color: C.green, background: C.greenBg, padding: '0.1rem 0.4rem', borderRadius: 99, flexShrink: 0 }}>Available</span>}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: C.muted }}>{w.skill} · {w.location}</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginBottom: 2 }}>
                      <Star size={9} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.text }}>{w.rating}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: C.faint }}>{w.rate}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border }} />

          {/* Open jobs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.text }}>Open jobs now</p>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 5px ${C.green}`, animation: 'ld-pulse 2s infinite', flexShrink: 0 }} />
              </div>
              <button onClick={() => go('have-skill')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: C.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                Apply <ChevronRight size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {LIVE_JOBS.map((job, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => go('have-skill')}
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '0.65rem', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#222220' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.card }}
                >
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, color: C.text, marginBottom: 3 }}>{job.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: '0.65rem', color: C.muted }}>{job.location}</span>
                      <span style={{ fontSize: '0.6rem', color: C.faint }}>·</span>
                      <span style={{ fontSize: '0.65rem', color: C.faint }}>{job.ago}</span>
                      {job.applicants === 0 && <span style={{ fontSize: '0.58rem', fontWeight: 700, color: C.orange, background: 'rgba(245,93,30,0.1)', padding: '0.1rem 0.35rem', borderRadius: 99 }}>No applicants</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 800, color: C.green }}>{job.budget}</p>
                    {job.applicants > 0 && <p style={{ fontSize: '0.62rem', color: C.faint }}>{job.applicants} applied</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES — Fiverr style ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) 1.5rem', background: C.canvas, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '4rem', alignItems: 'flex-start' }} className="ld-two-col">
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Browse by trade</p>
              <h2 style={{ fontSize: 'clamp(1.3rem,2.8vw,1.9rem)', fontWeight: 800, letterSpacing: '-0.025em', color: C.text, lineHeight: 1.15, marginBottom: '0.6rem' }}>
                What do you need done?
              </h2>
              <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.65 }}>
                Skilled workers across every trade in Wukari, ready to be hired.
              </p>
            </div>
            {/* Pill tags — LinkedIn pattern */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.25rem' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.label} onClick={() => go('need-done')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.95rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, color: C.mid, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.green; el.style.color = C.green; el.style.background = C.greenBg }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.border; el.style.color = C.mid; el.style.background = C.card }}
                >
                  <span>{cat.emoji}</span>{cat.label}
                  <span style={{ fontSize: '0.65rem', color: C.faint }}>{cat.workers}</span>
                </button>
              ))}
              <button onClick={() => go('need-done')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.5rem 0.95rem', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 700, color: C.green, cursor: 'pointer' }}>
                Show all <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── POST A JOB BAND ───────────────────────────────────────────────── */}
      <section style={{ background: 'rgba(245,93,30,0.08)', borderTop: `1px solid rgba(245,93,30,0.15)`, borderBottom: `1px solid rgba(245,93,30,0.15)`, padding: '1.5rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1rem,1.8vw,1.25rem)', fontWeight: 800, color: '#F97341', marginBottom: '0.2rem' }}>Need someone fast? Post a job for free.</h2>
            <p style={{ fontSize: '0.78rem', color: C.muted }}>500+ skilled workers in Wukari will see it instantly.</p>
          </div>
          <button onClick={() => go('need-done')}
            style={{ background: C.orange, color: '#fff', border: 'none', borderRadius: 10, padding: '0.72rem 1.5rem', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,93,30,0.25)', flexShrink: 0 }}>
            Post a job
          </button>
        </div>
      </section>

      {/* ── CAROUSEL — LinkedIn pattern: text left, circle image right ─── */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) 1.5rem', background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          {/* Slide progress bars — LinkedIn's dots as progress bars */}
          <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '2.5rem' }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => { setSlideIdx(i); if (slideTimer.current) clearInterval(slideTimer.current) }}
                style={{ height: 3, flex: slideIdx === i ? 3 : 1, background: slideIdx === i ? C.green : C.border, border: 'none', borderRadius: 99, cursor: 'pointer', transition: 'flex 0.4s, background 0.3s', padding: 0 }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={slideIdx}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}
              className="ld-two-col"
            >
              {/* Text side */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                  {SLIDES[slideIdx].tag}
                </p>
                <h2 style={{ fontSize: 'clamp(1.4rem,2.8vw,1.9rem)', fontWeight: 800, color: C.orange, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '1rem' }}>
                  {SLIDES[slideIdx].headline}
                </h2>
                <p style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.75, marginBottom: '1.5rem' }}>
                  {SLIDES[slideIdx].body}
                </p>
                <button onClick={() => go(SLIDES[slideIdx].situation)}
                  style={{ background: 'none', border: `1.5px solid ${C.green}`, borderRadius: 99, padding: '0.6rem 1.3rem', fontWeight: 700, fontSize: '0.85rem', color: C.green, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.greenBg }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
                >
                  {SLIDES[slideIdx].cta} →
                </button>
              </div>

              {/* Circle-cropped image — LinkedIn's rounded-[50%] pattern */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 360, height: 360, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <Img
                    src={SLIDES[slideIdx].img}
                    alt={SLIDES[slideIdx].headline}
                    emoji={SLIDES[slideIdx].emoji}
                    label={`Slide ${slideIdx + 1} · 450px circle`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── TWO TILES — LinkedIn's 128×128 icon + heading + CTA ─────────── */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) 1.5rem', background: C.canvas, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }} className="ld-two-col">
            {[
              { img: MEDIA.tileHire, emoji: '🔍', title: 'Find a skilled worker near you', body: 'Browse 500+ workers in Wukari. Filter by trade, location, and availability. Contact directly — no middleman.', cta: 'Find workers', situation: 'need-done' as Situation },
              { img: MEDIA.tileWork, emoji: '📋', title: 'Post your skills and start earning', body: 'No CV, no agency fees. Create your profile, list your trade, and start getting hired by people near you.', cta: 'Offer your skills', situation: 'have-skill' as Situation },
            ].map((tile, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                {/* 128×128 tile illustration — LinkedIn's exact size */}
                <div style={{ width: 128, height: 128, borderRadius: 16, overflow: 'hidden', marginBottom: '1.25rem', flexShrink: 0 }}>
                  <Img src={tile.img} alt={tile.title} emoji={tile.emoji} label="128×128" style={{ width: 128, height: 128, objectFit: 'cover', display: 'block' }} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: C.text, letterSpacing: '-0.015em', lineHeight: 1.25, marginBottom: '0.6rem' }}>{tile.title}</h3>
                <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.7, marginBottom: '1.1rem' }}>{tile.body}</p>
                <button onClick={() => go(tile.situation)}
                  style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 99, padding: '0.58rem 1.3rem', fontWeight: 700, fontSize: '0.82rem', color: C.mid, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.green; el.style.color = C.green }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.border; el.style.color = C.mid }}
                >
                  {tile.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS BUTSÓ FOR — LinkedIn's exact pattern ──────────────────── */}
      <section style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(3rem,6vw,5rem) 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="ld-two-col">

          {/* Left — LinkedIn's orange/red heading + chevron list */}
          <div>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, color: C.orange, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '0.5rem' }}>
              Who is Butsó for?
            </h2>
            <p style={{ fontSize: '0.85rem', color: C.muted, lineHeight: 1.7, marginBottom: '1.75rem' }}>
              Anyone doing or needing work in Wukari, Taraba State.
            </p>
            {/* LinkedIn's chevron row list */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {WHO_FOR.map((item, i) => (
                <button key={i} onClick={() => go(item.situation)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: 'none', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: C.mid, textAlign: 'left', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.color = C.text }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.02)'; el.style.color = C.mid }}
                >
                  <span>{item.icon}&nbsp;&nbsp;{item.label}</span>
                  <ChevronRight size={15} style={{ color: C.faint, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right — LinkedIn's 840×840 tall square illustration */}
          <div>
            <Img
              src={MEDIA.whoFor}
              alt="Who is Butsó for?"
              emoji="🧑‍🤝‍🧑"
              label={'600×720px · who-for.jpg'}
              style={{ width: '100%', height: 480, objectFit: 'cover', borderRadius: 20, display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <div style={{ background: C.green, padding: '1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', textAlign: 'center' }}>
          {[['500+', 'Skilled workers'], ['1,200+', 'Jobs completed'], ['4.8★', 'Average rating'], ['₦0', 'To sign up']].map(([v, l], i) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.72)', marginTop: '0.25rem', fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SUCCESS STORY — Fiverr case study style ──────────────────────── */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) 1.5rem', background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="ld-story-grid">
          {/* Photo */}
          <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', background: C.card, border: `1px solid ${C.border}`, position: 'relative' }}>
            <Img src={MEDIA.successStory} alt="Success story" emoji="📸" label={'Worker + client · success-story.jpg'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* Story text */}
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '1rem' }}>Success story</span>
            <h2 style={{ fontSize: 'clamp(1.3rem,2.8vw,1.9rem)', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.15, marginBottom: '1.1rem' }}>
              "I got 3 jobs in my first week on Butsó"
            </h2>
            <p style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Wunuken had been doing plumbing in Wukari for 8 years — mostly through word of mouth. Within a week of joining Butsó, he had 3 new clients who would never have found him otherwise.
            </p>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              {[['₦42,000', 'earned first month'], ['3 jobs', 'in first week'], ['4.9★', 'client rating']].map(([v, l], i) => (
                <div key={i}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: C.text, letterSpacing: '-0.02em' }}>{v}</div>
                  <div style={{ fontSize: '0.65rem', color: C.faint, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => go('have-skill')}
              style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '0.78rem 1.4rem', fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              Start earning like Wunuken <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) 1.5rem', background: C.canvas, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Simple process</p>
            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.1 }}>Up and running in 2 minutes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
            {[
              { e: '📱', t: 'Sign up free', b: 'Just your phone number. No CV, no documents, no fees — ever.' },
              { e: '🔍', t: 'Browse or post', b: 'Find skilled workers nearby or post your own skills and get hired.' },
              { e: '💬', t: 'Chat & agree', b: 'Message directly, agree on price. No middleman taking a cut.' },
              { e: '✅', t: 'Get it done', b: 'Work happens, payment tracked. Leave a rating when done.' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.6rem' }}>
                <div style={{ fontSize: '1.9rem', marginBottom: '1rem' }}>{s.e}</div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: C.text, marginBottom: '0.5rem', lineHeight: 1.3 }}>{s.t}</h3>
                <p style={{ fontSize: '0.78rem', color: C.muted, lineHeight: 1.65 }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA — LinkedIn "Join your colleagues" with bg image ─── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 300 }}>
        {/* Background image — LinkedIn's after: pseudo approach */}
        <Img src={MEDIA.bottomBg} alt="" emoji="🏙️" label="bottom-bg.jpg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Dark overlay — text floats on top */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.2) 100%)' }} />

        <div style={{ position: 'relative', maxWidth: 1160, margin: '0 auto', padding: 'clamp(3.5rem,7vw,5.5rem) 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="ld-two-col">
          <div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.5rem)', fontWeight: 900, color: C.text, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Join workers, employers, and shops already on Butsó
            </h2>
            <p style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.7, marginBottom: '1.75rem' }}>
              Wukari's first real work marketplace. Free to join, free to post, free to apply.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {['No CV needed', 'No fees ever', 'Direct payments'].map(l => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={13} style={{ color: C.green, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: C.mid, fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
            {/* LinkedIn's single "Get started" button */}
            <button onClick={() => go('have-skill')}
              style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '0.88rem 2rem', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(27,158,110,0.3)' }}>
              Get started — it's free
            </button>
          </div>
          {/* Right empty — image bleeds through */}
          <div />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '1.5rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, background: C.green, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 10 }}>B</span>
            </div>
            <span style={{ fontWeight: 900, color: C.text, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>Butsó</span>
            <span style={{ fontSize: '0.68rem', color: C.faint }}>© 2026 · Wukari, Taraba State</span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {[['Privacy', 'privacy'], ['Terms', 'terms'], ['Help', 'support']].map(([label, page]) => (
              <button key={page} onClick={() => setCurrentPage(page as any)}
                style={{ fontSize: '0.72rem', color: C.faint, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.color = C.muted)}
                onMouseLeave={e => (e.currentTarget.style.color = C.faint)}
              >{label}</button>
            ))}
          </div>
        </div>
      </footer>

      {/* ── GLOBAL STYLES ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes ld-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes ld-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @media (max-width: 900px) {
          .ld-hero-grid   { grid-template-columns: 1fr !important; }
          .ld-right-panel { display: none !important; }
          .ld-two-col     { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .ld-story-grid  { grid-template-columns: 1fr !important; }
          .ld-nav         { display: none !important; }
          .ld-location    { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  )
}