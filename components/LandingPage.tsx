'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { ChevronRight, MapPin, ArrowRight, CheckCircle, Award, Menu as MenuIcon, X as CloseIcon } from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { HeroSlideshow } from '@/components/HeroSlideshow'
import { IMAGES } from '@/lib/cloudinary'
import { fetchWorkers, type PublicWorker } from '@/lib/data'

import { EmojiIcon } from '@/components/EmojiIcon'
// ─── MEDIA SLOTS ──────────────────────────────────────────────────────────────
// All images now served from Cloudinary — see lib/cloudinary.ts.
// Everything shows a clean placeholder until real media arrives.
const MEDIA = {
  // Worker avatars — real worker images mapped by trade
  workers: [
    IMAGES.plumberman,          // Wunuken Danladi — Plumber
    IMAGES.cleanerwoman,        // Fatima Abdullahi — Cleaner
    IMAGES.electricianman,      // Zando Ishaku — Electrician
    IMAGES.carpenterman,        // Emeka Eze — Carpenter
    IMAGES.painterman,          // Wapuken Amos — Painter
    IMAGES.mechanicman,         // Yusuf Garba — Mechanic/Welder
  ],

  // Feature carousel slides
  slideWorkerPhone: IMAGES.mancalling,
  slideHandshake: IMAGES.workershandshake,
  slideShop: IMAGES.barberman,

  // Two-column tiles
  tileHire: IMAGES.happyman,
  tileWork: IMAGES.tailorgirl,

  // "Who is Butsó for?" section
  whoFor: IMAGES.constructionworkerpointing,

  // Bottom CTA section — wide street scene
  bottomBg: IMAGES.busyafricanstreet,

  // Success story section
  successStory: IMAGES.workershandshake,

  // Success story tile extras
  successExtra: IMAGES.familyinparlor,
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { emoji: '🔧', label: 'Plumbing', workers: 48, img: IMAGES.plumberman },
  { emoji: '⚡', label: 'Electrical', workers: 32, img: IMAGES.electricianman },
  { emoji: '🪵', label: 'Carpentry', workers: 27, img: IMAGES.carpenterman },
  { emoji: '🧹', label: 'Cleaning', workers: 91, img: IMAGES.cleanerwoman },
  { emoji: '🎨', label: 'Painting', workers: 35, img: IMAGES.painterman },
  { emoji: '🍳', label: 'Cooking', workers: 22, img: IMAGES.cheflady },
  { emoji: '🚗', label: 'Mechanics', workers: 18, img: IMAGES.mechanicman },
  { emoji: '🧵', label: 'Tailoring', workers: 14, img: IMAGES.tailorgirl },
  { emoji: '🏗️', label: 'Construction', workers: 56, img: IMAGES.bricklayer },
  { emoji: '🌿', label: 'Farming', workers: 11, img: IMAGES.farmerwoman },
  { emoji: '💇', label: 'Hair & Beauty', workers: 29, img: IMAGES.braidergirl },
  { emoji: '👕', label: 'Laundry', workers: 19, img: IMAGES.laundryladies },
  { emoji: '🔒', label: 'Security', workers: 8, img: IMAGES.securityman },
  { emoji: '🏠', label: 'Repairs', workers: 44, img: IMAGES.barberman },
]

// Quick-tap trending searches — what people in Wukari are actually asking for this week
const TRENDING: { emoji: string; label: string; situation: Situation }[] = [
  { emoji: '🔧', label: 'Emergency plumber', situation: 'need-done' },
  { emoji: '🧹', label: 'Weekend cleaner', situation: 'need-done' },
  { emoji: '💇', label: 'Hair braiding appointment', situation: 'exploring' },
  { emoji: '🔌', label: 'Generator repair', situation: 'need-done' },
  { emoji: '🎨', label: 'House painter', situation: 'need-done' },
  { emoji: '🚗', label: 'Daily school run driver', situation: 'need-done' },
  { emoji: '🍽️', label: 'Event caterer', situation: 'need-done' },
  { emoji: '🏗️', label: 'Bricklayer for extension', situation: 'need-done' },
  { emoji: '🧵', label: 'Aso-ebi tailor', situation: 'need-done' },
  { emoji: '🔒', label: 'Event security', situation: 'need-done' },
  { emoji: '🌿', label: 'Farm hand', situation: 'need-done' },
  { emoji: '🚗', label: 'Mechanic near me', situation: 'need-done' },
]

// Practical know-how — not fluff, just what actually moves the needle for workers and employers

// LinkedIn-style carousel slides: text left, circle-cropped image right
const SLIDES = [
  {
    tag: 'For employers',
    headline: 'Let workers know you have a job',
    body: 'Need a plumber, cleaner or carpenter? Post your job in under 2 minutes and start getting applications from nearby workers.',
    cta: 'Post a job',
    img: MEDIA.slideWorkerPhone,
    emoji: '📱',
    situation: 'need-done' as const,
  },
  {
    tag: 'For everyone',
    headline: 'Direct messages, no middleman',
    body: 'Chat directly with workers or employers. Agree a price, confirm the job, get it done. No agency in the middle.',
    cta: 'Start messaging',
    img: MEDIA.slideHandshake,
    emoji: '💬',
    situation: 'exploring' as const,
  },
  {
    tag: 'Book services',
    headline: 'Book a shop slot instantly',
    body: 'Book barbers, tailors and mechanics straight from the app. See who\'s available now. No calls. No waiting.',
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
function Img({ src, alt, emoji, label, style, className, eager }: {
  src: string; alt: string; emoji: string; label: string
  style?: React.CSSProperties; className?: string; eager?: boolean
}) {
  const [err, setErr] = useState(false)
  if (err) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8, background: 'rgba(27,158,110,0.07)', border: '1.5px dashed rgba(27,158,110,0.25)',
      borderRadius: 12, padding: '1rem', textAlign: 'center', color: '#1B9E6E', ...style,
    }} className={className}>
      <span style={{ display: 'inline-flex' }}>{emoji ? <EmojiIcon e={emoji} size={32} /> : null}</span>
      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>{label}</span>
    </div>
  )
  return <img src={src} alt={alt} style={style} className={className} onError={() => setErr(true)}
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'low'}
  />
}


// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function LandingPage() {
  const { setCurrentPage, darkMode, toggleDarkMode } = useAppStore()
  const jobs = useAppStore(st => st.jobs)
  const openJobs = jobs.filter(j => j.status === 'open').slice(0, 5)
  const [realWorkers, setRealWorkers] = useState<PublicWorker[]>([])
  useEffect(() => {
    let alive = true
    fetchWorkers().then(({ workers }) => { if (alive) setRealWorkers(workers) })
    return () => { alive = false }
  }, [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-advance carousel (LinkedIn pattern)
  useEffect(() => {
    slideTimer.current = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => { if (slideTimer.current) clearInterval(slideTimer.current) }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const go = (situation: Situation) => {
    sessionStorage.setItem('selectedSituation', situation)
    if (situation === 'exploring') {
      // Browse without logging in — land on jobs/workers view directly
      setCurrentPage('jobs')
    } else {
      // Role chosen — save it so ProfileSetup skips the role step
      sessionStorage.setItem('selectedRole', situation === 'need-done' ? 'employer' : 'worker')
      setCurrentPage('auth')
    }
  }

  // Palette — Butsó's own identity, switches with darkMode
  const C = darkMode ? {
    canvas: '#111110',
    surface: '#161614',
    card: '#1C1C1A',
    cardHover: '#222220',
    border: 'rgba(255,255,255,0.07)',
    text: '#F0EFEB',
    mid: '#C0BFB8',
    muted: '#8A8980',
    faint: '#3A3A36',
    green: '#1B9E6E',
    orange: '#F55D1E',
    greenBg: 'rgba(27,158,110,0.12)',
    headerBg: 'rgba(17,17,16,0.92)',
    pillBg: 'rgba(255,255,255,0.04)',
    pillBorder: 'rgba(255,255,255,0.14)',
    faqHover: 'rgba(255,255,255,0.05)',
    faqBase: 'rgba(255,255,255,0.02)',
  } : {
    canvas: '#FAFAF8',
    surface: '#FFFFFF',
    card: '#F2F1EC',
    cardHover: '#E8E7E0',
    border: 'rgba(17,17,16,0.08)',
    text: '#171715',
    mid: '#45443E',
    muted: '#6B6A61',
    faint: '#9A988D',
    green: '#1B9E6E',
    orange: '#F55D1E',
    greenBg: 'rgba(27,158,110,0.10)',
    headerBg: 'rgba(255,255,255,0.92)',
    pillBg: 'rgba(17,17,16,0.03)',
    pillBorder: 'rgba(17,17,16,0.12)',
    faqHover: 'rgba(17,17,16,0.05)',
    faqBase: 'rgba(17,17,16,0.02)',
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.canvas, color: C.text, fontFamily: 'var(--font-sans), system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: C.headerBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.border}` }}>
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
              { label: 'Browse Jobs', page: 'jobs' },
              { label: 'Find Workers', page: 'people' },
              { label: 'Book a Service', page: 'shops' },
            ].map(item => (
              <button key={item.label} onClick={() => setCurrentPage(item.page)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.82rem', color: C.muted, fontWeight: 600, borderBottom: '2px solid transparent', transition: 'color 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.text; el.style.borderBottomColor = C.green }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.muted; el.style.borderBottomColor = 'transparent' }}
              >{item.label}</button>
            ))}
          </nav>

          {/* Right: desktop shows everything, mobile keeps only Join free + menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ alignItems: 'center', gap: 5, fontSize: '0.7rem', color: C.faint, background: C.pillBg, border: `1px solid ${C.border}`, padding: '0.25rem 0.65rem', borderRadius: 99, flexShrink: 0 }} className="ld-location">
              <MapPin size={9} style={{ color: C.green }} />Near you
            </div>
            <button onClick={toggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="ld-desktop-only"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, minWidth: 44, minHeight: 44, borderRadius: 8, fontSize: '0.9rem', alignItems: 'center', justifyContent: 'center' }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => useAppStore.getState().openAuth('login')}
              className="ld-desktop-only"
              style={{ background: 'none', border: `1px solid ${C.pillBorder}`, borderRadius: 8, padding: '0 1rem', minHeight: 44, fontSize: '0.82rem', color: C.mid, fontWeight: 600, cursor: 'pointer', alignItems: 'center' }}>
              Log in
            </button>
            <button onClick={() => go('have-skill')}
              style={{ background: C.green, border: 'none', borderRadius: 8, padding: '0 1rem', minHeight: 44, fontSize: '0.82rem', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Join free →
            </button>
            <button onClick={() => setMenuOpen(o => !o)}
              className="ld-mobile-only"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="ld-mobile-menu"
              style={{ background: 'none', border: `1px solid ${C.pillBorder}`, borderRadius: 8, minWidth: 44, minHeight: 44, color: C.mid, cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}>
              {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div id="ld-mobile-menu" className="ld-mobile-menu" style={{ borderTop: `1px solid ${C.border}`, background: C.canvas, padding: '0.5rem 1.5rem 1rem' }}>
            <nav aria-label="Main" style={{ display: 'flex', flexDirection: 'column' }}>
              {[
              { label: 'Browse Jobs', page: 'jobs' },
              { label: 'Find Workers', page: 'people' },
              { label: 'Book a Service', page: 'shops' },
            ].map(item => (
                <button key={item.label} onClick={() => { setMenuOpen(false); setCurrentPage(item.page) }}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', minHeight: 48, padding: '0 0.25rem', fontSize: '0.95rem', color: C.text, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>
                  {item.label}
                </button>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
              <button onClick={() => { setMenuOpen(false); useAppStore.getState().openAuth('login') }}
                style={{ flex: 1, minWidth: 120, background: 'none', border: `1px solid ${C.pillBorder}`, borderRadius: 8, minHeight: 44, fontSize: '0.9rem', color: C.mid, fontWeight: 600, cursor: 'pointer' }}>
                Log in
              </button>
              <button onClick={toggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ background: 'none', border: `1px solid ${C.pillBorder}`, borderRadius: 8, minWidth: 44, minHeight: 44, fontSize: '1rem', cursor: 'pointer' }}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: C.muted }}>
                <MapPin size={11} style={{ color: C.green }} />Near you
              </div>
            </div>
          </div>
        )}
      </header>

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
                "Butsó" means work in Jukun
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(1.9rem,3.8vw,3rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.035em', marginBottom: '1rem', maxWidth: 460, color: '#F5F4F0' }}
            >
              Skilled workers.<br />
              <span style={{ color: C.green }}>Real jobs.</span><br />
              Right where you are.
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '0.92rem', color: 'rgba(240,239,235,0.62)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 380 }}
            >
              Need work done? Find skilled workers near you. Looking for work? List your skills and get hired. No agency. No CV. No wahala.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button onClick={() => go('need-done')}
                style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '0.82rem 1.5rem', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(27,158,110,0.35)', display: 'flex', alignItems: 'center', gap: 7 }}>
                Hire someone <ArrowRight size={14} />
              </button>
              <button onClick={() => go('have-skill')}
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: '#F5F4F0', border: `1px solid rgba(255,255,255,0.14)`, borderRadius: 10, padding: '0.82rem 1.5rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                Find work →
              </button>
            </motion.div>

            {/* Upwork-style social proof avatars */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(240,239,235,0.5)' }}>
                <strong style={{ color: '#F5F4F0' }}>Free to join</strong> · No CV needed
              </span>
            </motion.div>
          </div>
        </div>

        {/* RIGHT — LinkedIn live-content panel */}
        <div style={{ background: C.surface, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', maxHeight: 'calc(100vh - 96px)', padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="ld-right-panel">

          {realWorkers.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.text }}>People on Butsó</p>
                <button onClick={() => go('exploring')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: C.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, minHeight: 44 }}>
                  See all <ChevronRight size={11} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {realWorkers.slice(0, 5).map((w, i) => (
                  <motion.div key={w.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => go('exploring')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer' }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: C.greenBg, border: `2px solid ${C.green}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: C.green }}>
                      {w.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{w.username}</span>
                      <span style={{ fontSize: '0.68rem', color: C.muted }}>{w.skills.slice(0, 2).join(', ') || 'New member'}</span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {w.rating != null ? (
                        <>
                          <Award size={11} color="#F59E0B" strokeWidth={2.2} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.text }}>{w.rating.toFixed(1)}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: C.green }}>New</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {realWorkers.length > 0 && openJobs.length > 0 && <div style={{ height: 1, background: C.border }} />}

          {openJobs.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.text }}>Latest jobs</p>
                <button onClick={() => go('have-skill')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: C.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, minHeight: 44 }}>
                  Apply <ChevronRight size={11} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {openJobs.map((job, i) => (
                  <motion.div key={job.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => go('have-skill')}
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '0.65rem', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: C.text, marginBottom: 3 }}>{job.title}</p>
                      {job.location && job.location !== 'Not specified' && (
                        <span style={{ fontSize: '0.65rem', color: C.muted }}>{job.location}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 800, color: C.green, flexShrink: 0 }}>₦{job.budget.toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {realWorkers.length === 0 && openJobs.length === 0 && (
            <div style={{ padding: '1.25rem', borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: C.text, marginBottom: 6 }}>Be one of the first</p>
              <p style={{ fontSize: '0.78rem', color: C.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                Butsó is just getting started. Post a job or list your skills and show up first.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => go('need-done')} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '0 1rem', minHeight: 44, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Post a job</button>
                <button onClick={() => go('have-skill')} style={{ background: 'none', color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 1rem', minHeight: 44, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>List your skills</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TRENDING — quick-tap popular searches, Fiverr-style pill row ── */}
      <section style={{ padding: 'clamp(2.5rem,5vw,3.5rem) 1.5rem', background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Popular right now</p>
          <h2 style={{ fontSize: 'clamp(1.2rem,2.4vw,1.6rem)', fontWeight: 800, letterSpacing: '-0.02em', color: C.text, marginBottom: '1.5rem' }}>
            Popular things to look for
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {TRENDING.map(item => (
              <button key={item.label} onClick={() => go(item.situation)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0.55rem 1rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: 99, fontSize: '0.82rem', fontWeight: 600, color: C.mid, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s, background 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.green; el.style.color = C.green; el.style.background = C.greenBg }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.border; el.style.color = C.mid; el.style.background = C.card }}
              >
                <span><EmojiIcon e={item.emoji} size={20} /></span>{item.label}
              </button>
            ))}
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
                Skilled workers across every trade, ready to be hired.
              </p>
            </div>
            {/* Pill tags — LinkedIn pattern */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.25rem' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.label} onClick={() => go('need-done')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem 0.4rem 0.4rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, color: C.mid, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.green; el.style.color = C.green; el.style.background = C.greenBg }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.border; el.style.color = C.mid; el.style.background = C.card }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: C.faint }}>
                    <img src={cat.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  {cat.label}
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
            <p style={{ fontSize: '0.78rem', color: C.muted }}>Workers nearby can see it and apply.</p>
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
                <div style={{ width: 'min(360px, 80vw)', height: 'min(360px, 80vw)', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
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
              { img: MEDIA.tileHire, emoji: '🔍', title: 'Find a skilled worker near you', body: 'Browse workers near you. Filter by trade, location and availability. Contact them directly.', cta: 'Find workers', situation: 'need-done' as Situation },
              { img: MEDIA.tileWork, emoji: '📋', title: 'Post your skills and start earning', body: 'No CV, no agency in the middle. Create your profile, list your trade, and start getting hired by people near you.', cta: 'Offer your skills', situation: 'have-skill' as Situation },
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
              Anyone doing or needing work.
            </p>
            {/* LinkedIn's chevron row list */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {WHO_FOR.map((item, i) => (
                <button key={i} onClick={() => go(item.situation)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 0.75rem', background: C.faqBase, border: 'none', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: C.mid, textAlign: 'left', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.faqHover; el.style.color = C.text }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.faqBase; el.style.color = C.mid }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}><EmojiIcon e={item.icon} size={18} />{item.label}</span>
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
              emoji=""
              label={'600×720px · who-for.jpg'}
              style={{ width: '100%', height: 480, objectFit: 'cover', borderRadius: 20, display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <div style={{ background: C.green, padding: '1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          {[['₦0', 'To sign up'], ['No CV', 'Needed to get hired'], ['Local', 'Work near you'], ['Direct', 'Chat, agree a price, done']].map(([v, l], i) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.72)', marginTop: '0.25rem', fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) 1.5rem', background: C.canvas, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Simple process</p>
            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.1 }}>Up and running in 2 minutes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
            {[
              { e: '', t: 'Sign up free', b: 'Use your email or Google. No CV, no documents. Free to join.' },
              { e: '', t: 'Browse or post', b: 'Find skilled workers nearby or post your own skills and get hired.' },
              { e: '', t: 'Chat & agree', b: 'Message directly, agree on price. No middleman taking a cut.' },
              { e: '', t: 'Get it done', b: 'Work happens, payment tracked. Leave a rating when done.' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenBg, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1rem' }}>{i + 1}</div>
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
        <Img src={MEDIA.bottomBg} alt="" emoji="" label="bottom-bg.jpg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Dark overlay — text floats on top */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.2) 100%)' }} />

        <div style={{ position: 'relative', maxWidth: 1160, margin: '0 auto', padding: 'clamp(3.5rem,7vw,5.5rem) 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="ld-two-col">
          <div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.5rem)', fontWeight: 900, color: '#F5F4F0', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Join workers, employers, and shops already on Butsó
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'rgba(245,244,240,0.75)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
              Work and workers, near you. Free to join, free to post and free to apply while we grow.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {['No CV needed', 'Free to join', 'Agree prices directly'].map(l => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={13} style={{ color: C.green, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'rgba(245,244,240,0.88)', fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
            {/* LinkedIn's single "Get started" button */}
            <button onClick={() => go('have-skill')}
              style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '0.88rem 2rem', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(27,158,110,0.3)' }}>
              Get started for free
            </button>
          </div>
          {/* Right empty — image bleeds through */}
          <div />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '1.5rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }} className="ld-footer-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, background: C.green, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 10 }}>B</span>
            </div>
            <span style={{ fontWeight: 900, color: C.text, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>Butsó</span>
            <span style={{ fontSize: '0.68rem', color: C.faint }}>© 2026 Butsó</span>
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
        .ld-mobile-menu { display: none; }
        .ld-mobile-only { display: none !important; }
        .ld-desktop-only { display: flex !important; }
        .ld-location { display: flex; }
        @media (max-width: 900px) {
          .ld-mobile-menu  { display: block; }
          .ld-mobile-only  { display: flex !important; }
          .ld-desktop-only { display: none !important; }
          .ld-hero-grid   { grid-template-columns: 1fr !important; }
          .ld-right-panel { display: none !important; }
          .ld-two-col     { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .ld-story-grid  { grid-template-columns: 1fr !important; }
          .ld-nav         { display: none !important; }
          .ld-location    { display: none !important; }
        }
        @media (max-width: 480px) {
          .ld-hero-min    { min-height: 92dvh !important; }
          .ld-footer-row  { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  )
}