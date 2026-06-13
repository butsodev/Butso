'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, MapPin, Zap, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { mockWorkers } from '@/lib/mockData'

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
  const { setCurrentPage, preferences, trackSearch } = useAppStore()
  const [query, setQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<typeof mockWorkers[0] | null>(null)

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

  const filtered = mockWorkers.filter(w => {
    const matchesQuery =
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.bio.toLowerCase().includes(query.toLowerCase()) ||
      w.skills.some(s => s.toLowerCase().includes(query.toLowerCase())) ||
      w.location.toLowerCase().includes(query.toLowerCase()) ||
      w.username.toLowerCase().includes(query.toLowerCase())
    const matchesSkill = selectedSkill === 'all' || w.skills.includes(selectedSkill)
    const matchesAvailable = !availableOnly || w.available
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
                <p className="text-primary-foreground/75 text-sm flex items-center gap-1.5 mb-2">
                  <MapPin size={13} /> {selectedWorker.location}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 font-bold">
                    <Star size={14} fill="currentColor" className="text-yellow-300" />
                    {selectedWorker.rating.toFixed(1)}
                  </span>
                  <span className="text-primary-foreground/60">·</span>
                  <span className="text-primary-foreground/80">{selectedWorker.completedJobs} jobs done</span>
                  <span className="text-primary-foreground/60">·</span>
                  <span className="text-primary-foreground/80 font-semibold">₦{selectedWorker.hourlyRate.toLocaleString()}/hr</span>
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
              className="grid grid-cols-3 gap-3"
            >
              {[
                { label: 'Rating', value: selectedWorker.rating.toFixed(1), icon: '⭐' },
                { label: 'Jobs Done', value: selectedWorker.completedJobs, icon: '✅' },
                { label: 'Rate/hr', value: `₦${(selectedWorker.hourlyRate / 1000).toFixed(0)}k`, icon: '💰' },
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
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

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentPage('messaging')}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition text-sm"
                >
                  💬 Send Message
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentPage('post-job')}
                  className="flex-1 py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition text-sm border border-border"
                >
                  📋 Hire for Job
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
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
            placeholder="Search by name, skill, or @username..."
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
          <button onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition border ${availableOnly ? 'bg-green-500/15 text-green-700 border-green-400/40 dark:text-green-400' : 'bg-card border-border text-muted-foreground'}`}>
            <Zap size={12} /> Available now
          </button>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {visibleFilters.map(f => (
            <motion.button key={f.id} whileTap={{ scale: 0.93 }} onClick={() => setSelectedSkill(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-colors shrink-0 ${selectedSkill === f.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-card border border-border text-foreground hover:border-primary/50'}`}>
              <span>{f.emoji}</span>{f.label}
            </motion.button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-bold text-foreground mb-1">Nobody found</p>
            <p className="text-sm text-muted-foreground">Try a different skill or remove the filter</p>
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
                      {worker.available ? <span className="shrink-0 w-2 h-2 rounded-full bg-green-500" /> : <span className="shrink-0 w-2 h-2 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{worker.location}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {worker.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                  <span className="flex items-center gap-1 font-bold text-foreground">
                    <Star size={11} fill="currentColor" className="text-yellow-500" />{worker.rating.toFixed(1)}
                    <span className="text-muted-foreground font-normal">({worker.completedJobs})</span>
                  </span>
                  <span className="font-bold text-primary">₦{worker.hourlyRate.toLocaleString()}/hr</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
          <p className="text-primary-foreground/75 text-sm">Browse skilled workers in Wukari</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 pb-8">
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search by name, skill, or @username..."
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
              <span>{f.emoji}</span>
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
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-12 text-center"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-bold text-foreground mb-1">Nobody found</p>
            <p className="text-sm text-muted-foreground">Try a different skill or remove the filter</p>
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
                        {worker.available ? (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-green-500" title="Available" />
                        ) : (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-muted-foreground/30" title="Busy" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {worker.location}
                      </p>
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
                    <span className="flex items-center gap-1 font-bold text-foreground min-w-0">
                      <Star size={12} fill="currentColor" className="text-yellow-500 shrink-0" />
                      {worker.rating.toFixed(1)}
                      <span className="text-muted-foreground font-normal ml-0.5 truncate">({worker.completedJobs} jobs)</span>
                    </span>
                    <span className="font-bold text-primary shrink-0">₦{worker.hourlyRate.toLocaleString()}/hr</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}