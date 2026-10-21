'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, X } from 'lucide-react'
import { useState } from 'react'
import { WUKARI_AREAS } from '@/lib/areas'
import { useAppStore, goBackTo } from '@/lib/store'

const CATEGORIES = [
  'Carpentry', 'Plumbing', 'Electrical', 'Painting',
  'Welding', 'House Cleaning', 'Landscaping', 'Repairs',
]

const BUDGET_RANGES = [
  { label: '₦0 – ₦5,000',      min: 0,     max: 5000 },
  { label: '₦5,000 – ₦15,000',  min: 5000,  max: 15000 },
  { label: '₦15,000 – ₦30,000', min: 15000, max: 30000 },
  { label: '₦30,000 – ₦50,000', min: 30000, max: 50000 },
  { label: '₦50,000+',          min: 50000, max: Infinity },
]

export function AdvancedSearch() {
  const { setCurrentPage, setJobSearch } = useAppStore()
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [budget,   setBudget]   = useState<typeof BUDGET_RANGES[0] | null>(null)
  const [area,     setArea]     = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const activeFilters = [
    query    && `"${query}"`,
    category && `Category: ${category}`,
    budget   && `Budget: ${budget.label}`,
  ].filter((f): f is string => Boolean(f))

  const handleSearch = () => {
    // Push filters into the store then jump to the jobs list — it reads them directly
    setJobSearch({
      query,
      category,
      budgetMin: budget?.min ?? null,
      budgetMax: budget?.max ?? null,
      area: area ?? null,
    })
    setCurrentPage('jobs')
  }

  const handleClear = () => {
    setQuery(''); setCategory(null); setBudget(null); setArea(null)
    setJobSearch({ query: '', category: null, budgetMin: null, budgetMax: null, area: null })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-foreground pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <button aria-label="Go back" onClick={() => goBackTo('jobs')}
            className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Advanced Search</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">

        {/* Search bar */}
        <div className="relative">
          <input
            type="text" aria-label="Search jobs"
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by title or description…"
            className="w-full px-4 py-3 pl-10 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search size={20} className="absolute left-3 top-3.5 text-muted-foreground" />
        </div>

        {/* Filter toggle */}
        <button onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 text-primary font-medium hover:opacity-80 transition">
          <Filter size={18} />
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="space-y-6 pb-6 border-b border-border overflow-hidden"
          >
            {/* Category */}
            <div>
              <h3 className="font-bold text-foreground mb-3">Category</h3>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(category === cat ? null : cat)}
                    className={`p-3 rounded-lg text-left text-sm font-medium transition ${
                      category === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:bg-secondary'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="font-bold text-foreground mb-3">Budget range</h3>
              <div className="space-y-2">
                {BUDGET_RANGES.map(r => (
                  <button key={r.label} onClick={() => setBudget(budget?.label === r.label ? null : r)}
                    className={`w-full p-3 rounded-lg text-left text-sm font-medium transition ${
                      budget?.label === r.label
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:bg-secondary'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {activeFilters.map(f => (
              <span key={f} className="bg-primary/15 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {f}
              </span>
            ))}
            <button onClick={handleClear} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition">
              <X size={14} /> Clear all
            </button>
          </div>
        )}

        {/* Search button */}
        <button onClick={handleSearch}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow">
          Search Jobs
        </button>
      </div>
    </motion.div>
  )
}
