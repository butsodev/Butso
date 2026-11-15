'use client'

// The landing page: one story, top to bottom.
//   hero -> who is already here (real data) -> trades -> how it works for each kind of person
//   -> the privacy promise -> join.
// Colours come from the theme tokens (app/globals.css, brand.md), so light and dark both work.
// Photos come from Cloudinary at the size they are shown. Entrance and scroll animations are
// plain CSS (.rise / .reveal), so nothing waits for JavaScript to become visible.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, Menu as MenuIcon, X as CloseIcon, Sun, Moon, EyeOff, MessageCircle, ShieldCheck,
  Briefcase, Hammer, Store, MapPin,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { HeroSlideshow } from '@/components/HeroSlideshow'
import { cldSized, cldSrcSet, cldThumb } from '@/lib/cloudinary'
import { fetchWorkers, type PublicWorker } from '@/lib/data'

type Situation = 'need-done' | 'have-skill' | 'exploring'

const NAV = [
  { label: 'Jobs', href: '/jobs' },
  { label: 'Workers', href: '/people' },
  { label: 'Shops', href: '/shops' },
  { label: 'Help', href: '/support' },
]

// Trades with a real photo. Tapping one opens the people list, which guests can browse.
const TRADES = [
  { label: 'Plumbing', img: 'plumberman' },
  { label: 'Electrical', img: 'electricianman' },
  { label: 'Tailoring', img: 'tailorgirl' },
  { label: 'Barbing', img: 'barberman' },
  { label: 'Hair braiding', img: 'braidergirl' },
  { label: 'Carpentry', img: 'carpenterman' },
  { label: 'Cleaning', img: 'cleanerwoman' },
  { label: 'Painting', img: 'painterman' },
  { label: 'Cooking', img: 'cheflady' },
  { label: 'Mechanics', img: 'mechanicman' },
  { label: 'Building', img: 'bricklayer' },
  { label: 'Laundry', img: 'laundryladies' },
]

const PATHS: {
  icon: typeof Briefcase; tag: string; title: string; img: string; steps: string[]; cta: string; situation: Situation
}[] = [
  {
    icon: Briefcase, tag: 'Need something done', title: 'Hire someone near you', img: 'happyman',
    steps: ['Post a job in two minutes. It is free.', 'People nearby apply. Check their skills and reviews.', 'Pick one, chat, agree a price and pay them directly.'],
    cta: 'Post a job', situation: 'need-done',
  },
  {
    icon: Hammer, tag: 'Looking for work', title: 'Get hired for your skills', img: 'mancalling',
    steps: ['Make a profile with your skills. No CV needed.', 'Apply to jobs near you, or get hired straight from your profile.', 'Do good work, get reviews, get picked again.'],
    cta: 'Find work', situation: 'have-skill',
  },
  {
    icon: Store, tag: 'Run a shop', title: 'Let customers book you', img: 'familyinparlor',
    steps: ['List your services, prices, opening hours and work photos.', 'Customers pick a time and send a booking.', 'Accept it, do the job, collect reviews.'],
    cta: 'Set up a shop', situation: 'have-skill',
  },
]

const initials = (s: string) => s.replace(/^@/, '').slice(0, 2).toUpperCase()

function ThemeToggle({ className = '' }: { className?: string }) {
  const darkMode = useAppStore(s => s.darkMode)
  const toggle = useAppStore(s => s.toggleDarkMode)
  return (
    <button type="button" onClick={toggle} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${className}`}>
      {darkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Butsó home">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-black text-[15px]" aria-hidden="true">B</span>
      <span className="font-heading text-xl font-black tracking-tight text-foreground">Butsó</span>
    </Link>
  )
}

export function LandingPage() {
  const setCurrentPage = useAppStore(s => s.setCurrentPage)
  const openAuth = useAppStore(s => s.openAuth)
  const jobs = useAppStore(s => s.jobs)
  const openJobs = jobs.filter(j => j.status === 'open').slice(0, 4)
  const [workers, setWorkers] = useState<PublicWorker[] | null>(null) // null = still loading
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let alive = true
    fetchWorkers(undefined, { limit: 8 }).then(({ workers }) => { if (alive) setWorkers(workers) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Remember what they came for, so sign-up can skip the "what brings you here" step
  const go = (situation: Situation) => {
    try {
      sessionStorage.setItem('selectedSituation', situation)
      if (situation !== 'exploring') sessionStorage.setItem('selectedRole', situation === 'need-done' ? 'employer' : 'worker')
    } catch { /* private mode: they just answer the question again */ }
    if (situation === 'exploring') setCurrentPage('jobs')
    else setCurrentPage('auth')
  }

  const showLive = workers === null || workers.length > 0 || openJobs.length > 0

  return (
    <div className="min-h-dvh bg-background text-foreground overflow-x-clip">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button type="button" onClick={() => openAuth('login')}
              className="hidden md:inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
              Log in
            </button>
            <button type="button" onClick={() => go('have-skill')}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
              Join free
            </button>
            <button type="button" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen} aria-controls="landing-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground">
              {menuOpen ? <CloseIcon size={20} aria-hidden="true" /> : <MenuIcon size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div id="landing-menu" className="md:hidden border-t border-border bg-background px-4 pb-4">
            <nav aria-label="Main" className="flex flex-col">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center border-b border-border text-base font-semibold text-foreground">
                  {n.label}
                </Link>
              ))}
            </nav>
            <button type="button" onClick={() => { setMenuOpen(false); openAuth('login') }}
              className="mt-4 h-11 w-full rounded-xl border border-border text-sm font-semibold text-foreground">
              Log in
            </button>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative isolate flex min-h-[560px] items-center lg:min-h-[640px] h-[calc(100svh-4rem)] max-h-[780px]">
          <HeroSlideshow className="absolute inset-0 -z-10" />
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-xl">
              <p className="rise mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                <MapPin size={12} aria-hidden="true" /> “Butsó” means “work” in Jukun
              </p>
              <h1 className="rise font-heading text-[2.6rem] leading-[1.02] font-black tracking-tight text-balance text-white sm:text-6xl" style={{ '--d': '60ms' } as React.CSSProperties}>
                Skilled workers.<br />
                {/* Fixed light green: this text always sits on a dark photo, in both themes */}
                <span className="text-[#5EE0A8]">Real jobs.</span><br />
                Right where you are.
              </h1>
              <p className="rise mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg" style={{ '--d': '120ms' } as React.CSSProperties}>
                Find a plumber, tailor or cleaner nearby, or get hired for what you do. No agency, no CV, no wahala.
              </p>
              <div className="rise mt-8 flex flex-wrap gap-3" style={{ '--d': '180ms' } as React.CSSProperties}>
                <button type="button" onClick={() => go('need-done')}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-raised hover:opacity-90 transition-opacity">
                  Hire someone <ArrowRight size={18} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => go('have-skill')}
                  className="inline-flex h-12 items-center rounded-xl border border-white/30 bg-white/10 px-6 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                  Find work
                </button>
              </div>
              <ul className="rise mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85" style={{ '--d': '240ms' } as React.CSSProperties}>
                {['Free to join', 'No CV needed', 'Your number stays private'].map(t => (
                  <li key={t} className="flex items-center gap-1.5"><Check size={16} className="text-[#5EE0A8]" aria-hidden="true" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Who is already here (real data) ─────────────────────────────── */}
        {showLive && (
          <section aria-labelledby="live-title" className="border-b border-border bg-card">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 id="live-title" className="font-heading text-2xl font-black tracking-tight">Already on Butsó</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Real people near you. Names and numbers stay hidden until they say yes.</p>
                </div>
                <Link href="/people" className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-primary hover:underline">
                  See everyone <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                {workers === null
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[84px] w-64 shrink-0 animate-pulse rounded-2xl bg-muted sm:w-auto" aria-hidden="true" />
                  ))
                  : workers.slice(0, 8).map(w => (
                    <Link key={w.id} href={`/@${w.username}`}
                      className="flex w-64 shrink-0 snap-start items-center gap-3 rounded-2xl border border-border bg-background p-3.5 hover:border-primary/40 hover:shadow-card transition sm:w-auto">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-black text-primary" aria-hidden="true">
                        {initials(w.username)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-foreground">@{w.username}</span>
                        <span className="block truncate text-sm text-muted-foreground">{w.skills.slice(0, 2).join(', ') || 'New on Butsó'}</span>
                      </span>
                    </Link>
                  ))}
              </div>

              {openJobs.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Latest jobs</h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {openJobs.map(j => (
                      <li key={j.id}>
                        <Link href={`/jobs/${j.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4 hover:border-primary/40 transition">
                          <span className="min-w-0">
                            <span className="block truncate font-bold">{j.title}</span>
                            <span className="block truncate text-sm text-muted-foreground">{[j.category, j.location].filter(Boolean).join(' · ')}</span>
                          </span>
                          {j.budget > 0 && <span className="shrink-0 font-bold text-primary">₦{j.budget.toLocaleString('en-NG')}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link href="/people" className="mt-4 inline-flex sm:hidden items-center gap-1 py-2 text-sm font-bold text-primary">
                See everyone <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}

        {/* ── Trades ─────────────────────────────────────────────────────── */}
        <section aria-labelledby="trades-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="reveal mb-8 max-w-xl">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Every trade</p>
            <h2 id="trades-title" className="mt-2 font-heading text-3xl font-black tracking-tight text-balance sm:text-4xl">What do you need done?</h2>
            <p className="mt-3 text-muted-foreground">From a dripping tap to an aso-ebi order. Pick a trade to see who is around.</p>
          </div>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {TRADES.map(t => (
              <li key={t.label} className="reveal">
                <Link href="/people" className="group block overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-card transition">
                  <span className="block aspect-square overflow-hidden bg-muted">
                    <img src={cldThumb(t.img, 240)} srcSet={`${cldThumb(t.img, 240)} 1x, ${cldThumb(t.img, 480)} 2x`}
                      alt="" loading="lazy" decoding="async" width={240} height={240}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </span>
                  <span className="block px-3 py-2.5 text-sm font-bold text-foreground">{t.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── How it works, per kind of person ─────────────────────────────── */}
        <section aria-labelledby="how-title" className="border-y border-border bg-secondary/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="reveal mb-10 max-w-xl">
              <p className="text-sm font-bold uppercase tracking-wide text-primary">How it works</p>
              <h2 id="how-title" className="mt-2 font-heading text-3xl font-black tracking-tight text-balance sm:text-4xl">Up and running in minutes</h2>
              <p className="mt-3 text-muted-foreground">One account does it all. Hire today, take a job tomorrow, open your shop next week.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {PATHS.map(p => (
                <article key={p.title} className="reveal flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <img src={cldSized(p.img, 640)} srcSet={cldSrcSet(p.img, [400, 640, 960])} sizes="(min-width: 1024px) 33vw, 100vw"
                      alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-foreground backdrop-blur-sm">
                      <p.icon size={14} className="text-primary" aria-hidden="true" /> {p.tag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-heading text-xl font-black tracking-tight">{p.title}</h3>
                    <ol className="mt-4 flex-1 space-y-3">
                      {p.steps.map((s, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-black text-primary" aria-hidden="true">{i + 1}</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                    <button type="button" onClick={() => go(p.situation)}
                      className="mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-primary/30 px-4 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      {p.cta} <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy promise: the thing that makes Butsó different ─────────── */}
        <section aria-labelledby="privacy-title" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div className="reveal">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Privacy by default</p>
            <h2 id="privacy-title" className="mt-2 font-heading text-3xl font-black tracking-tight text-balance sm:text-4xl">Your number stays yours</h2>
            <p className="mt-3 text-muted-foreground">Strangers never get your phone number or real name. You decide who does, and the rules are enforced by the database, not just the screen.</p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: EyeOff, title: 'People see @username', body: 'Your real name and photo stay hidden until you share them.' },
                { icon: MessageCircle, title: 'First contact is a short request', body: 'Accept it and a chat opens. Decline it and they cannot keep trying.' },
                { icon: ShieldCheck, title: 'Block or report in one tap', body: 'On any chat, job, shop, review or profile.' },
              ].map(f => (
                <li key={f.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary"><f.icon size={20} aria-hidden="true" /></span>
                  <span>
                    <span className="block font-bold">{f.title}</span>
                    <span className="block text-sm text-muted-foreground">{f.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* A picture of what a stranger sees: decorative, the list above says it in words */}
          <div className="reveal" aria-hidden="true">
            <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card p-6 shadow-raised">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-lg font-black text-primary">AT</span>
                <div>
                  <p className="font-bold">@ada_tailor</p>
                  <p className="text-sm text-muted-foreground">Tailoring · Aso-ebi · Alterations</p>
                </div>
              </div>
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Real name</span>
                  <span className="flex items-center gap-1.5 font-semibold"><EyeOff size={14} /> Hidden</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Phone number</span>
                  <span className="flex items-center gap-1.5 font-semibold"><EyeOff size={14} /> Hidden</span>
                </div>
              </div>
              <div className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                <MessageCircle size={16} /> Send a message request
              </div>
            </div>
          </div>
        </section>

        {/* ── Join ───────────────────────────────────────────────────────── */}
        <section aria-labelledby="join-title" className="relative isolate overflow-hidden">
          <img src={cldSized('busyafricanstreet', 1280)} srcSet={cldSrcSet('busyafricanstreet', [640, 1280, 1920])} sizes="100vw"
            alt="" loading="lazy" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="reveal max-w-xl">
              <h2 id="join-title" className="font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">Work is closer than you think</h2>
              <p className="mt-4 text-lg text-white/80">Free to join, free to post, free to apply. If that ever changes, you will hear from us at least 30 days before.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => go('have-skill')}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground hover:opacity-90 transition-opacity">
                  Join Butsó free <ArrowRight size={18} aria-hidden="true" />
                </button>
                <Link href="/jobs"
                  className="inline-flex h-12 items-center rounded-xl border border-white/30 bg-white/10 px-6 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                  Look around first
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">Your local work network. © {new Date().getFullYear()} Butsó</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
            {[...NAV, { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }].map(n => (
              <Link key={n.href} href={n.href} className="py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{n.label}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
