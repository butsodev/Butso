'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Zap, SlidersHorizontal, X } from 'lucide-react'
import { RatingBadge } from '@/components/Rating'
import { useState, useEffect, useRef } from 'react'
import { proximityLabel } from '@/lib/areas'
import { useAppStore } from '@/lib/store'
import { fetchWorkers, fetchWorkerByRef, refreshJobs, type PublicWorker } from '@/lib/data'
import { fetchInvitesToWorker, sendJobInvite, type InviteStatus } from '@/lib/dataInvites'
import { useHireIntent } from '@/lib/hireIntent'
import { showToast } from '@/lib/toast'

import { EmojiIcon } from '@/components/EmojiIcon'
const skillFilters = [
  { id: 'all', label: 'Everyone', emoji: '👥' },
  { id: 'Barbing', label: 'Barbing', emoji: '✂️' },
  { id: 'Plumbing', label: 'Plumbing', emoji: '🔧' },
  { id: 'Tailoring', label: 'Tailoring', emoji: '👗' },
  { id: 'Cleaning', label: 'Cleaning', emoji: '🧹' },
  { id: 'Electrical', label: 'Electrical', emoji: '⚡' },
  { id: 'Cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'Auto Repair', label: 'Auto Repair', emoji: '🚗' },
  { id: 'Carpentry', label: 'Carpentry', emoji: '🪵' },
]

// How many filter pills to show before "more" nudge
const VISIBLE_FILTERS = 5

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const card = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
}

export function PeopleSearch({ embedded = false }: { embedded?: boolean }) {
  const { setCurrentPage, currentUser, preferences, trackSearch, viewedWorkerId, viewedUsername, openChatWith, jobs, openAuth } = useAppStore()
  const [workers, setWorkers] = useState<PublicWorker[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<PublicWorker | null>(null)

  // ── Hire this person ──
  const [hireOpen, setHireOpen] = useState(false)
  const [invited, setInvited] = useState<Map<string, InviteStatus>>(new Map())
  const [sendingJobId, setSendingJobId] = useState<string | null>(null)
  const openHire = async () => {
    if (!currentUser) { openAuth('login'); return }
    if (!selectedWorker) return
    setHireOpen(true)
    await refreshJobs()
    setInvited(await fetchInvitesToWorker(currentUser.id, selectedWorker.id))
  }
  const hireForJob = async (jobId: string) => {
    if (!selectedWorker) return
    setSendingJobId(jobId)
    const err = await sendJobInvite(jobId, selectedWorker.id)
    setSendingJobId(null)
    if (err) { showToast('error', err); return }
    setInvited(prev => new Map(prev).set(jobId, 'pending'))
    showToast('success', `Invite sent to ${selectedWorker.name}`)
  }
  const postJobFor = () => {
    if (!selectedWorker) return
    useHireIntent.getState().setTarget({ id: selectedWorker.id, name: selectedWorker.name })
    setHireOpen(false)
    setCurrentPage('post-job')
  }
  const myOpenJobs = jobs.filter(j => j.employerId === currentUser?.id && j.status === 'open' && !j.selectedWorkerId)
  const isSelfProfile = !!currentUser && selectedWorker?.id === currentUser.id

  // Fair, paged worker list. A new seed each visit means the order rotates and nobody holds a fixed top spot.
  const PAGE = 40
  const seedRef = useRef(Math.random().toString(36).slice(2))
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    let cancelled = false
    setLoadState('loading')
    fetchWorkers(currentUser?.id, { seed: seedRef.current, query: debouncedQuery, skill: selectedSkill, limit: PAGE }).then(({ workers: list, error }) => {
      if (cancelled) return
      if (error) { setLoadState('error'); return }
      setWorkers(list)
      setHasMore(list.length === PAGE)
      setLoadState('ready')
    })
    return () => { cancelled = true }
  }, [currentUser?.id, reloadKey, debouncedQuery, selectedSkill])

  const loadMore = async () => {
    setLoadingMore(true)
    const { workers: more, error } = await fetchWorkers(currentUser?.id, {
      seed: seedRef.current, query: debouncedQuery, skill: selectedSkill, limit: PAGE, offset: workers.length,
    })
    setLoadingMore(false)
    if (error) { showToast('error', 'Could not load more people.'); return }
    setWorkers(prev => [...prev, ...more.filter(m => !prev.some(p => p.id === m.id))])
    setHasMore(more.length === PAGE)
  }

  // Open a specific worker when another screen asks for one (works even if they are not on the first page)
  useEffect(() => {
    if (!viewedWorkerId || loadState === 'loading') return
    const id = viewedWorkerId
    useAppStore.setState({ viewedWorkerId: null })
    const worker = workers.find(w => w.id === id)
    if (worker) setSelectedWorker(worker)
    else fetchWorkerByRef({ id }).then(w => { if (w) setSelectedWorker(w) })
  }, [viewedWorkerId, workers, loadState])

  // /@username: open a worker's profile directly from their public link
  useEffect(() => {
    if (!viewedUsername || loadState === 'loading') return
    const uname = viewedUsername
    useAppStore.setState({ viewedUsername: null })
    const worker = workers.find(w => w.username?.toLowerCase() === uname.toLowerCase())
    if (worker) setSelectedWorker(worker)
    else fetchWorkerByRef({ username: uname }).then(w => { if (w) setSelectedWorker(w) })
  }, [viewedUsername, workers, loadState])

  // Recent searches — top 4 by frequency, min 1 search
  const recentSearches = Object.entries(preferences.searched ?? {})
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([term]) => term)

  const handleSearch = (val: string) => {
    setQuery(val)
    if (val.trim().length >= 2) trackSearch(val.trim().toLowerCase())
  }

  const visibleFilters = showAllFilters ? skillFilters : skillFilters.slice(0, VISIBLE_FILTERS + 1)

  // Availability isn't stored yet, so only offer that filter once real data has it
  const hasAvailability = workers.some(w => w.available !== null)

  const filtered = workers.filter(w => {
    const q = query.toLowerCase()
    const matchesQuery =
      w.skills.some(s => s.toLowerCase().includes(q)) ||
      (w.location ?? '').toLowerCase().includes(q) ||
      w.username.toLowerCase().includes(q)
    const matchesSkill = selectedSkill === 'all' || w.skills.includes(selectedSkill)
    const matchesAvailable = !availableOnly || w.available === true
    return matchesQuery && matchesSkill && matchesAvailable
  })

  // ── Full-screen worker profile modal ─────────────────────────────────────
  if (selectedWorker) {
    return (
      <AnimatePresence>
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="min-h-screen bg-background pb-24"
        >
          {/* Hero */}
          <div className="bg-gradient-to-br from-primary to-primary/70 px-4 sm:px-6 pt-8 pb-16 text-primary-foreground relative">
            <button
              onClick={() => setSelectedWorker(null)}
              className="flex items-center gap-2 mb-6 hover:opacity-80 transition text-sm font-semibold"
            >
              ← Back to People
            </button>
            <div className="max-w-2xl mx-auto flex items-start gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-4xl font-black text-white">{selectedWorker.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-white">{selectedWorker.name}</h1>
                  {selectedWorker.available && (
                    <span className="text-xs bg-green-400/25 text-green-200 border border-green-400/40 px-2 py-0.5 rounded-full font-bold">
                      Available
                    </span>
                  )}
                </div>
                {selectedWorker.location && (
                  <p className="text-primary-foreground/75 text-sm flex items-center gap-1.5 mb-2">
                    <MapPin size={13} /> {selectedWorker.location}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <RatingBadge value={selectedWorker.rating ?? 'New'} size="sm" onDark />
                  <span className="text-primary-foreground/60">·</span>
                  <span className="text-primary-foreground/80">{selectedWorker.completedJobs} jobs done</span>
                  {selectedWorker.hourlyRate != null && (
                    <>
                      <span className="text-primary-foreground/60">·</span>
                      <span className="text-primary-foreground/80 font-semibold">₦{selectedWorker.hourlyRate.toLocaleString()}/hr</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6 space-y-4">
            {/* Bio */}
            <motion.div
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h2 className="text-sm font-black text-muted-foreground uppercase tracking-wide mb-3">About</h2>
              <p className="text-foreground leading-relaxed">{selectedWorker.bio}</p>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h2 className="text-sm font-black text-muted-foreground uppercase tracking-wide mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {selectedWorker.skills.map(s => (
                  <span key={s} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className={`grid gap-3 ${selectedWorker.hourlyRate != null ? 'grid-cols-3' : 'grid-cols-2'}`}
            >
              {[
                { label: 'Rating', value: selectedWorker.rating != null ? selectedWorker.rating.toFixed(1) : 'New', icon: 'rating' },
                { label: 'Jobs Done', value: selectedWorker.completedJobs, icon: '✅' },
                ...(selectedWorker.hourlyRate != null
                  ? [{ label: 'Rate/hr', value: `₦${(selectedWorker.hourlyRate / 1000).toFixed(0)}k`, icon: '💰' }]
                  : []),
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1"><EmojiIcon e={stat.icon} size={24} /></div>
                  <p className="text-xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Contact privacy note */}
            <motion.div
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h2 className="text-sm font-black text-muted-foreground uppercase tracking-wide mb-2">Contact</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Phone number is hidden until you connect. Send a message to get started.
              </p>

              {isSelfProfile ? (
                <p className="text-sm text-muted-foreground">This is how your profile looks to others.</p>
              ) : (
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openChatWith({ userId: selectedWorker.id, name: selectedWorker.name })}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition text-sm"
                  >
                    Send Message
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={openHire}
                    className="flex-1 py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition text-sm border border-border"
                  >
                    Hire for Job
                  </motion.button>
                </div>
              )}
              <button
                onClick={() => useAppStore.getState().openReviews(selectedWorker.id)}
                className="mt-3 w-full py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition text-sm"
              >
                Ratings &amp; reviews
              </button>
            </motion.div>
          </div>
        </motion.div>

        {hireOpen && (
          <div key="hire-modal" className="fixed inset-0 z-[70] bg-black/50 flex items-end sm:items-center justify-center p-4 pb-24 sm:pb-4" onClick={() => setHireOpen(false)}>
            <div role="dialog" aria-label="Hire for a job" onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[70vh] overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-black text-foreground">Hire {selectedWorker.name}</h2>
                <button aria-label="Close" onClick={() => setHireOpen(false)} className="p-2 hover:bg-secondary rounded-xl"><X size={18} /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Pick one of your open jobs. They get an invite and can accept or decline.</p>
              <div className="space-y-2">
                {myOpenJobs.map(j => {
                  const st = invited.get(j.id)
                  return (
                    <div key={j.id} className="flex items-center justify-between gap-3 border border-border rounded-xl p-3">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{j.title}</p>
                        <p className="text-xs text-muted-foreground">₦{j.budget.toLocaleString()} · {j.category}</p>
                      </div>
                      {st === 'pending' ? <span className="text-xs font-bold text-muted-foreground shrink-0">Invited</span>
                        : st === 'declined' ? <span className="text-xs font-bold text-muted-foreground shrink-0">Declined</span>
                        : (
                          <button onClick={() => hireForJob(j.id)} disabled={sendingJobId === j.id}
                            className="px-3 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg disabled:opacity-50 shrink-0">
                            {sendingJobId === j.id ? 'Sending...' : 'Invite'}
                          </button>
                        )}
                    </div>
                  )
                })}
                {myOpenJobs.length === 0 && <p className="text-sm text-muted-foreground py-2">You have no open jobs yet.</p>}
              </div>
              <button onClick={postJobFor}
                className="mt-4 w-full py-3 border border-border text-foreground font-bold rounded-xl hover:bg-secondary transition text-sm">
                + Post a new job for {selectedWorker.name}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  // ── Search list ───────────────────────────────────────────────────────────
  // When embedded inside ShopsBrowsing, render without the full page shell
  if (embedded) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-8 pt-3">
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            aria-label="Search people"
            placeholder="Search by skill or @username..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-border rounded-2xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 bg-card shadow-sm transition text-sm"
          />
        </div>
        {recentSearches.length > 0 && !query && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-muted-foreground shrink-0">Recent:</span>
            {recentSearches.map(term => (
              <button key={term} onClick={() => setQuery(term)}
                className="text-xs px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition capitalize">
                {term}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'person' : 'people'} found</p>
          {hasAvailability && (
          <button onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition border ${availableOnly ? 'bg-green-500/15 text-green-700 border-green-400/40 dark:text-green-400' : 'bg-card border-border text-muted-foreground'}`}>
            <Zap size={12} /> Available now
          </button>
          )}
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {visibleFilters.map(f => (
            <motion.button key={f.id} whileTap={{ scale: 0.93 }} onClick={() => setSelectedSkill(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-colors shrink-0 ${selectedSkill === f.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-card border border-border text-foreground hover:border-primary/50'}`}>
              <span><EmojiIcon e={f.emoji} size={20} /></span>{f.label}
            </motion.button>
          ))}
        </div>
        {loadState === 'loading' ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center" role="status" aria-live="polite">
            <p className="text-sm text-muted-foreground animate-pulse">Loading people...</p>
          </div>
        ) : loadState === 'error' ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="font-bold text-foreground mb-1">Could not load people</p>
            <p className="text-sm text-muted-foreground mb-4">Check your connection and try again.</p>
            <button onClick={() => setReloadKey(k => k + 1)}
              className="px-5 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3"><EmojiIcon e="🔍" size={34} /></div>
            <p className="font-bold text-foreground mb-1">Nobody found</p>
            <p className="text-sm text-muted-foreground">{workers.length === 0 ? "No workers have signed up yet" : "Try a different skill or remove the filter"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(worker => (
              <motion.div key={worker.id} whileHover={{ y: -3 }} onClick={() => setSelectedWorker(worker)}
                className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-primary">{worker.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-foreground text-sm truncate">{worker.name}</h3>
                      {worker.available === true ? <span className="shrink-0 w-2 h-2 rounded-full bg-green-500" title="Available" /> : worker.available === false ? <span className="shrink-0 w-2 h-2 rounded-full bg-muted-foreground/30" title="Busy" /> : null}
                    </div>
                    {worker.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {worker.location}
                        {proximityLabel(currentUser?.location, worker.location) && (
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {proximityLabel(currentUser?.location, worker.location)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {worker.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                  <span className="flex items-center gap-1.5 font-bold text-foreground">
                    <RatingBadge value={worker.rating ?? 'New'} size="xs" />
                    <span className="text-muted-foreground font-normal">({worker.completedJobs})</span>
                  </span>
                  {worker.hourlyRate != null && <span className="font-bold text-primary">₦{worker.hourlyRate.toLocaleString()}/hr</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {hasMore && !loadingMore && filtered.length > 0 && (
          <button onClick={loadMore} className="mt-4 w-full py-3 border border-border text-foreground font-bold rounded-xl hover:bg-secondary transition text-sm">
            Show more people
          </button>
        )}
        {loadingMore && <p className="mt-4 text-center text-sm text-muted-foreground">Loading...</p>}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="min-h-screen bg-background pb-24"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black mb-1">Find People</h1>
          <p className="text-primary-foreground/75 text-sm">Browse skilled workers near you</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 pb-8">
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            aria-label="Search people"
            placeholder="Search by skill or @username..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-border rounded-2xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 bg-card shadow-sm transition text-sm"
          />
        </div>

        {/* Recent searches */}
        {recentSearches.length > 0 && !query && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-muted-foreground shrink-0">Recent:</span>
            {recentSearches.map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="text-xs px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition capitalize"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Available toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'person' : 'people'} found
          </p>
          {hasAvailability && (
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition border ${availableOnly
              ? 'bg-green-500/15 text-green-700 border-green-400/40 dark:text-green-400'
              : 'bg-card border-border text-muted-foreground'
              }`}
          >
            <Zap size={12} />
            Available now
          </button>
          )}
        </div>

        {/* Skill pills */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {visibleFilters.map(f => (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedSkill(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-colors shrink-0 ${selectedSkill === f.id
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-card border border-border text-foreground hover:border-primary/50'
                }`}
            >
              <span><EmojiIcon e={f.emoji} size={20} /></span>
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* More categories nudge */}
        {!showAllFilters ? (
          <p className="text-xs text-muted-foreground mb-5">
            Don't see your category?{' '}
            <button
              onClick={() => setShowAllFilters(true)}
              className="text-primary font-semibold hover:underline"
            >
              See all categories
            </button>
            {' '}or search above.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mb-5">
            <button
              onClick={() => setShowAllFilters(false)}
              className="text-primary font-semibold hover:underline"
            >
              Show less
            </button>
          </p>
        )}

        {/* Results */}
        {loadState === 'loading' ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center" role="status" aria-live="polite">
            <p className="text-sm text-muted-foreground animate-pulse">Loading people...</p>
          </div>
        ) : loadState === 'error' ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="font-bold text-foreground mb-1">Could not load people</p>
            <p className="text-sm text-muted-foreground mb-4">Check your connection and try again.</p>
            <button onClick={() => setReloadKey(k => k + 1)}
              className="px-5 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-12 text-center"
          >
            <div className="text-4xl mb-3"><EmojiIcon e="🔍" size={34} /></div>
            <p className="font-bold text-foreground mb-1">Nobody found</p>
            <p className="text-sm text-muted-foreground">{workers.length === 0 ? "No workers have signed up yet" : "Try a different skill or remove the filter"}</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSkill + query + availableOnly}
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {filtered.map(worker => (
                <motion.div
                  key={worker.id}
                  variants={card}
                  whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400 } }}
                  onClick={() => setSelectedWorker(worker)}
                  className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-xl font-black text-primary">{worker.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-black text-foreground truncate">{worker.name}</h3>
                        {worker.available === true ? (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-green-500" title="Available" />
                        ) : worker.available === false ? (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-muted-foreground/30" title="Busy" />
                        ) : null}
                      </div>
                      {worker.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {worker.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {worker.bio}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {worker.skills.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-3 border-t border-border flex-wrap">
                    <span className="flex items-center gap-1.5 font-bold text-foreground min-w-0">
                      <RatingBadge value={worker.rating ?? 'New'} size="xs" className="shrink-0" />
                      <span className="text-muted-foreground font-normal ml-0.5 truncate">({worker.completedJobs} jobs)</span>
                    </span>
                    {worker.hourlyRate != null && <span className="font-bold text-primary shrink-0">₦{worker.hourlyRate.toLocaleString()}/hr</span>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        {hasMore && !loadingMore && filtered.length > 0 && (
          <button onClick={loadMore} className="mt-4 w-full py-3 border border-border text-foreground font-bold rounded-xl hover:bg-secondary transition text-sm">
            Show more people
          </button>
        )}
        {loadingMore && <p className="mt-4 text-center text-sm text-muted-foreground">Loading...</p>}
      </div>
    </motion.div>
  )
}