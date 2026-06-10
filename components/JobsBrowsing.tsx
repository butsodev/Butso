'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, DollarSign, Clock, SlidersHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { SkeletonJobsList } from '@/components/Skeleton'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 26 },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

const categories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'Construction', label: 'Construction', emoji: '🏗️' },
  { id: 'Plumbing', label: 'Plumbing', emoji: '🔧' },
  { id: 'Electrical', label: 'Electrical', emoji: '⚡' },
  { id: 'Cleaning', label: 'Cleaning', emoji: '🧹' },
  { id: 'Repairs', label: 'Repairs', emoji: '🛠️' },
]

export function JobsBrowsing() {
  const { jobs, setCurrentPage } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  // PHASE 5+6: Skeleton on mount
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory
    return matchesSearch && matchesCategory && job.status === 'open'
  })

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
          <motion.div
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
          >
            <h1 className="text-2xl sm:text-3xl font-black mb-1">Available Jobs</h1>
            <p className="text-primary-foreground/75 text-sm">Find work near you in Wukari</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 pb-8">
        {/* Search */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
          className="relative mb-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search jobs, skills, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-12 py-3.5 border border-border rounded-2xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 bg-card shadow-sm transition text-sm"
          />
          <button
            onClick={() => setCurrentPage('advanced-search')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary rounded-lg transition"
          >
            <SlidersHorizontal size={16} className="text-muted-foreground" />
          </button>
        </motion.div>

        {/* Category pills — PHASE 6: layoutId for smooth active indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-colors ${isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-card border border-border text-foreground hover:border-primary/50'
                  }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Jobs list — PHASE 5: skeleton while loading */}
        {loading ? (
          <SkeletonJobsList count={4} />
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-12 text-center"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-bold text-foreground mb-1">No jobs found</p>
            <p className="text-sm text-muted-foreground">Try a different category or search term</p>
          </motion.div>
        ) : (
          // PHASE 6: AnimatePresence + stagger for list changes
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchQuery}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={cardVariants}
                  whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400 } }}
                  onClick={() => setCurrentPage('job-details')}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-foreground mb-0.5 truncate">{job.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      {job.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-4 gap-y-1.5 mb-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                      <DollarSign size={13} className="text-emerald-600" />
                      <span className="font-semibold text-foreground">₦{job.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                      <MapPin size={13} className="text-primary shrink-0" />
                      <span className="truncate max-w-[120px]">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                      <Clock size={13} />
                      <span>{job.applicants.length} applied</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentPage('apply-job')
                    }}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition text-sm"
                  >
                    Apply Now
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}