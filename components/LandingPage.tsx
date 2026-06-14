'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const tickerItems = [
  '🔧 Plumber needed · Wukari GRA',
  '⚡ Electrician · 3-day job',
  '🧹 Office cleaner · weekly',
  '🏗️ Carpenter · furniture build',
  '🎨 House painter · 4 rooms',
  '🌿 Gardener · monthly',
  '🍳 Event cook · Saturday',
  '🚗 Driver · school run',
  '🛠️ Welder · gate repair',
  '👷 Bricklayer · extension job',
]

type Situation = 'need-done' | 'have-skill' | 'exploring'

const situations: { id: Situation; emoji: string; headline: string; sub: string; pills: string[] }[] = [
  {
    id: 'need-done',
    emoji: '📋',
    headline: 'I need something done',
    sub: 'Find someone to do a job for you — fast, local, no agency.',
    pills: ['Fix my pipe', 'Paint my house', 'Clean my office', 'Build furniture'],
  },
  {
    id: 'have-skill',
    emoji: '🛠️',
    headline: 'I have a skill to offer',
    sub: 'Find jobs near you. Any skill welcome, no CV needed.',
    pills: ['Plumber', 'Electrician', 'Cleaner', 'Carpenter'],
  },
  {
    id: 'exploring',
    emoji: '👀',
    headline: 'Just looking around',
    sub: "See what's available. No commitment — pick a role whenever you're ready.",
    pills: ['Tailoring', 'Driving', 'Cooking', 'Teaching'],
  },
]

export function LandingPage() {
  const { setCurrentPage, setCurrentUser, darkMode, toggleDarkMode } = useAppStore()
  const [hovered, setHovered] = useState<Situation | null>(null)
  const [pressed, setPressed] = useState<Situation | null>(null)
  const [tickerPaused, setTickerPaused] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Show the animated hand hint after 1.2s — gives cards time to load in first
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const choose = (situation: Situation) => {
    setPressed(situation)
    setShowHint(false)
    sessionStorage.setItem('selectedSituation', situation)

    if (situation === 'exploring') {
      setTimeout(() => setCurrentPage('explore-onboarding'), 280)
    } else {
      // Map to legacy role for phone verification flow
      sessionStorage.setItem('selectedRole', situation === 'need-done' ? 'need-help' : 'find-work')
      setTimeout(() => setCurrentPage('phone-verification'), 280)
    }
  }

  return (
    <div className="land-root">
      <style>{`
        .land-root {
          min-height: 100dvh;
          background: #1C1C19;
          color: #F0EFEB;
          display: flex;
          flex-direction: column;
          font-family: var(--font-sans), system-ui, sans-serif;
        }

        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 30s linear infinite;
        }
        .ticker-track.paused { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }

        /* situation cards */
        .sit-card {
          position: relative;
          border-radius: 1.1rem;
          padding: 1.4rem 1.5rem;
          text-align: left;
          cursor: pointer;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: #242420;
          transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s;
          overflow: hidden;
          width: 100%;
        }
        .sit-card:hover {
          background: #2A2A26;
          transform: translateY(-3px);
        }
        .sit-card:active { transform: scale(0.98); }
        .sit-card.active-need {
          border-color: #F55D1E;
          background: rgba(245,93,30,0.1);
          box-shadow: 0 6px 28px rgba(245,93,30,0.18);
        }
        .sit-card.active-skill {
          border-color: #1B9E6E;
          background: rgba(27,158,110,0.12);
          box-shadow: 0 6px 28px rgba(27,158,110,0.22);
        }
        .sit-card.active-explore {
          border-color: rgba(255,255,255,0.25);
          background: #2E2E2A;
        }
        .sit-card:hover.card-need   { border-color: rgba(245,93,30,0.5); }
        .sit-card:hover.card-skill  { border-color: rgba(27,158,110,0.5); }
        .sit-card:hover.card-explore{ border-color: rgba(255,255,255,0.18); }

        .pill-small {
          display: inline-block;
          font-size: 0.67rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
          background: rgba(255,255,255,0.08);
          color: rgba(240,239,235,0.7);
        }
        .pill-small.need    { background: rgba(245,93,30,0.15);  color: #F55D1E; }
        .pill-small.skill   { background: rgba(27,158,110,0.15); color: #1B9E6E; }
        .pill-small.explore { background: rgba(255,255,255,0.08); color: rgba(240,239,235,0.6); }

        .divider { height: 1px; background: rgba(255,255,255,0.07); }

        .stat-num {
          font-family: var(--font-heading), serif;
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #F0EFEB;
        }

        .step-card {
          background: #242420;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        /* Pulsing glow on cards — subtle breathing to show they're alive */
        @keyframes card-breathe {
          0%, 100% { box-shadow: 0 0 0 0 rgba(27,158,110,0); transform: translateY(0px); }
          50% { box-shadow: 0 8px 30px rgba(27,158,110,0.12); transform: translateY(-2px); }
        }
        .sit-card-need-breathe {
          animation: card-breathe-need 3.5s ease-in-out infinite;
        }
        .sit-card-skill-breathe {
          animation: card-breathe-skill 3.5s ease-in-out infinite 0.4s;
        }
        .sit-card-explore-breathe {
          animation: card-breathe-explore 3.5s ease-in-out infinite 0.8s;
        }
        @keyframes card-breathe-need {
          0%, 100% { box-shadow: 0 2px 12px rgba(245,93,30,0); }
          50% { box-shadow: 0 6px 28px rgba(245,93,30,0.15); }
        }
        @keyframes card-breathe-skill {
          0%, 100% { box-shadow: 0 2px 12px rgba(27,158,110,0); }
          50% { box-shadow: 0 6px 28px rgba(27,158,110,0.18); }
        }
        @keyframes card-breathe-explore {
          0%, 100% { box-shadow: 0 2px 12px rgba(255,255,255,0); }
          50% { box-shadow: 0 6px 28px rgba(255,255,255,0.06); }
        }

        /* Bouncing hand pointer */
        @keyframes hand-bounce {
          0%, 100% { transform: translateY(0px); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-6px); }
        }
        .hand-bounce {
          animation: hand-bounce 1.4s ease-in-out infinite;
          display: inline-block;
        }

        /* Ripple on card press */
        @keyframes ripple-out {
          0% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.03); opacity: 0; }
        }

        .step-n {
          font-family: var(--font-heading), serif;
          font-size: 3.5rem;
          font-weight: 800;
          color: #1B9E6E;
          opacity: 0.2;
          line-height: 1;
          letter-spacing: -0.04em;
          margin-bottom: -0.25rem;
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(28,28,25,0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0.7rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setCurrentPage('splash')} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, background: '#1B9E6E', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: 'var(--font-heading), serif' }}>B</span>
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#F0EFEB', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading), serif' }}>Butsó</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', color: '#8A8980', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: 99 }}>
              <MapPin size={10} style={{ color: '#1B9E6E' }} />
              Wukari, Taraba State
            </div>
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A8980', flexShrink: 0 }}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Ticker ──────────────────────────────────────────── */}
      <div
        style={{ background: '#1B9E6E', overflow: 'hidden', padding: '0.4rem 0', cursor: 'default' }}
        onMouseEnter={() => setTickerPaused(true)}
        onMouseLeave={() => setTickerPaused(false)}
      >
        <div className={`ticker-track${tickerPaused ? ' paused' : ''}`}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', padding: '0 2rem' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(2.5rem,7vw,4.5rem) 1.25rem clamp(2rem,5vw,3.5rem)', position: 'relative', overflow: 'hidden' }}>
        {/* ambient glow */}
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: 560, height: 260, background: 'radial-gradient(ellipse, rgba(27,158,110,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} style={{ marginBottom: '1.1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.75rem', fontWeight: 700, color: '#1B9E6E', background: 'rgba(27,158,110,0.12)', padding: '0.28rem 0.85rem', borderRadius: 99, border: '1px solid rgba(27,158,110,0.22)' }}>
              🇳🇬 &nbsp;"Butsó" means <strong>"work"</strong> in Jukun · Built for Wukari
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: 'easeOut' }}
            style={{ fontFamily: 'var(--font-heading), serif', fontSize: 'clamp(2.2rem,6vw,3.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1rem' }}
          >
            What's your<br />
            <em style={{ color: '#1B9E6E', fontStyle: 'italic' }}>situation right now?</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.45, ease: 'easeOut' }}
            style={{ fontSize: '0.92rem', color: '#8A8980', lineHeight: 1.65, marginBottom: '2rem', maxWidth: 430 }}
          >
            Pick one — we'll show you what's relevant to you straight away. No account needed yet.
          </motion.p>

          {/* ── Situation cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}
          >
            {situations.map((sit) => {
              const colorKey = sit.id === 'need-done' ? 'need' : sit.id === 'have-skill' ? 'skill' : 'explore'
              const breatheClass = pressed ? '' : (sit.id === 'need-done' ? 'sit-card-need-breathe' : sit.id === 'have-skill' ? 'sit-card-skill-breathe' : 'sit-card-explore-breathe')
              const accentColor = sit.id === 'need-done' ? '#F55D1E' : sit.id === 'have-skill' ? '#1B9E6E' : '#F0EFEB'
              const isPressed = pressed === sit.id

              return (
                <button
                  key={sit.id}
                  className={`sit-card card-${colorKey} ${breatheClass}${isPressed ? ` active-${colorKey === 'need' ? 'need' : colorKey === 'skill' ? 'skill' : 'explore'}` : ''}`}
                  onClick={() => choose(sit.id)}
                  onMouseEnter={() => setHovered(sit.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {/* Emoji */}
                    <div style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{sit.emoji}</div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: '0.3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading), serif', fontSize: '1.1rem', fontWeight: 800, color: '#F0EFEB', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                          {sit.headline}
                        </h2>
                        <ArrowRight size={15} style={{ color: accentColor, flexShrink: 0, opacity: hovered === sit.id || isPressed ? 1 : 0.4, transition: 'opacity 0.15s, transform 0.15s', transform: hovered === sit.id ? 'translateX(3px)' : 'none' }} />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#8A8980', lineHeight: 1.55, marginBottom: '0.75rem' }}>
                        {sit.sub}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {sit.pills.map(p => (
                          <span key={p} className={`pill-small ${colorKey}`}>{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </motion.div>

          {/* Animated hand hint — shows after 1.2s, hides on first tap */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '-0.5rem' }}
              >
                <span className="hand-bounce" style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.3rem' }}>
                  👆
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8A8980', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Tap to get started
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex' }}>
              {['👷', '👩‍🔧', '👨‍💼', '👩‍💼', '🧑‍🍳'].map((e, i) => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: '#2A2A26', border: '2px solid #1C1C19', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', marginLeft: i > 0 ? -7 : 0 }}>{e}</div>
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#8A8980' }}>
              <strong style={{ color: '#F0EFEB' }}>500+ workers</strong> in Wukari already on Butsó
            </span>
            <span style={{ fontSize: '0.8rem', color: '#5A5A54' }}>· Free to join</span>
          </motion.div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Stats ───────────────────────────────────────────── */}
      <section style={{ padding: '2.25rem 1.25rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', textAlign: 'center' }}>
          {[
            { v: '500+', l: 'Workers' },
            { v: '1.2k+', l: 'Jobs done' },
            { v: '4.8★', l: 'Avg rating' },
            { v: '₦0', l: 'To join' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.07 }}>
              <div className="stat-num">{s.v}</div>
              <div style={{ fontSize: '0.72rem', color: '#8A8980', marginTop: '0.3rem', fontWeight: 500 }}>{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── How it works ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(2.5rem,6vw,3.5rem) 1.25rem', background: '#222220' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1B9E6E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>How it works</p>
          <h2 style={{ fontFamily: 'var(--font-heading), serif', fontSize: 'clamp(1.4rem,3.5vw,1.9rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Up and running in minutes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              { n: '01', emoji: '📱', title: 'Pick your situation', body: 'No account needed to look around. Sign up only when you want to act.' },
              { n: '02', emoji: '🔍', title: 'Browse what matters', body: 'See jobs and workers filtered to your interests from the first second.' },
              { n: '03', emoji: '💰', title: 'Connect and get paid', body: 'Chat, agree the price, get it done. Payments tracked and protected.' },
            ].map((s, i) => (
              <div key={i} className="step-card" style={{ borderRadius: 0 }}>
                <div className="step-n">{s.n}</div>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.6rem' }}>{s.emoji}</div>
                <h3 style={{ fontWeight: 800, fontSize: '0.92rem', color: '#F0EFEB', marginBottom: '0.4rem', lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: '0.78rem', color: '#8A8980', lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      <section style={{ padding: 'clamp(2.5rem,7vw,4rem) 1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: 400, height: 160, background: 'radial-gradient(ellipse, rgba(27,158,110,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--font-heading), serif', fontSize: 'clamp(1.6rem,4vw,2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.65rem', lineHeight: 1.15 }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#8A8980', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Takes under 2 minutes. No CV. No fees.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => choose('have-skill')}
              style={{ background: '#1B9E6E', color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0.95rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(27,158,110,0.3)' }}>
              🛠️ I have a skill to offer
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => choose('need-done')}
              style={{ background: 'rgba(245,93,30,0.12)', color: '#F55D1E', border: '1px solid rgba(245,93,30,0.3)', borderRadius: '0.875rem', padding: '0.95rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              📋 I need something done
            </motion.button>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => choose('exploring')}
              style={{ background: 'transparent', color: '#8A8980', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.875rem', padding: '0.85rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              👀 Just browsing for now
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem 1.25rem' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <button onClick={() => setCurrentPage('splash')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 20, height: 20, background: '#1B9E6E', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 10, fontFamily: 'var(--font-heading), serif' }}>B</span>
            </div>
            <span style={{ fontWeight: 900, color: '#F0EFEB', fontFamily: 'var(--font-heading), serif', fontSize: '0.9rem' }}>Butsó</span>
          </button>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {[['Privacy', 'privacy'], ['Terms', 'terms'], ['Help', 'support']].map(([label, page]) => (
              <button key={page} onClick={() => setCurrentPage(page as any)}
                style={{ fontSize: '0.73rem', color: '#8A8980', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1B9E6E')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8A8980')}
              >{label}</button>
            ))}
          </div>
          <p style={{ fontSize: '0.7rem', color: '#5A5A54' }}>© 2026 Butsó · Wukari, Taraba State</p>
        </div>
      </footer>
    </div>
  )
}