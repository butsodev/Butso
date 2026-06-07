'use client'

import { motion } from 'framer-motion'
import { Search, MapPin, DollarSign, Clock } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function JobsBrowsing() {
  const { jobs, setCurrentPage } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Construction', 'Plumbing', 'Electrical', 'Cleaning', 'Repairs']

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory
    return matchesSearch && matchesCategory && job.status === 'open'
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-1">Available Jobs</h1>
          <p className="text-white/80">Browse and apply for jobs in your area</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-8">
        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mb-6 mt-6"
        >
          <Search className="absolute left-4 top-3.5 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground bg-white shadow-sm"
          />
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white border border-border text-foreground hover:border-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Jobs List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground mb-2">No jobs found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => setCurrentPage('job-details')}
                className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md cursor-pointer transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{job.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full whitespace-nowrap ml-4">
                    {job.category}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-accent" />
                    <div>
                      <p className="text-muted-foreground text-xs">Budget</p>
                      <p className="font-semibold text-foreground">₦{job.budget}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Location</p>
                      <p className="font-semibold text-foreground text-xs">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-blue-500" />
                    <div>
                      <p className="text-muted-foreground text-xs">Applicants</p>
                      <p className="font-semibold text-foreground">{job.applicants.length}</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPage('apply-job')
                  }}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
                >
                  Apply Now
                </motion.button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
