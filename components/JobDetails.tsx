'use client'

import { motion } from 'framer-motion'
import { MapPin, DollarSign, Clock, User, Star, ChevronLeft, Share2, Heart } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function JobDetails() {
  const { setCurrentPage, jobs, currentUser } = useAppStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Get first open job as example
  const job = jobs.find(j => j.status === 'open') || {
    id: '1',
    title: 'Bathroom Renovation',
    description: 'Complete bathroom renovation including tiling, fixtures, and painting. Need experienced professional with references.',
    category: 'Construction',
    budget: 250000,
    location: 'Central Wukari',
    employerId: 'emp1',
    status: 'open' as const,
    applicants: ['worker1', 'worker2'],
    createdAt: new Date().toISOString(),
  }

  const employer = {
    id: 'emp1',
    name: 'Mr. Okafor',
    avatar: '👨‍💼',
    rating: 4.8,
    completedJobs: 12,
    bio: 'Professional property developer with over 10 years of experience',
  }

  const handleApply = () => {
    setIsApplying(true)
    setTimeout(() => {
      setCurrentPage('apply-job')
      setIsApplying(false)
    }, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header with back button */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage('jobs')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition font-semibold"
          >
            <ChevronLeft size={20} />
            Back to Jobs
          </motion.button>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition ${
                isFavorite
                  ? 'bg-red-100 text-red-500'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition"
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Job Header */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{job.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full">
                    {job.category}
                  </span>
                  <span>{job.applicants.length} applicants</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-accent">₦{job.budget.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total budget</p>
              </div>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <MapPin className="text-primary" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-blue-500" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Posted</p>
                  <p className="font-semibold text-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="text-orange-500" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground">One-time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4">About This Job</h2>
            <p className="text-foreground leading-relaxed mb-4">{job.description}</p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-foreground">Professional with experience in similar projects required</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-foreground">References or portfolio needed</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-foreground">Start within 1 week preferred</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-foreground">Flexible timeline for completion</span>
              </div>
            </div>
          </div>

          {/* Employer Card */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4">About the Employer</h2>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{employer.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{employer.name}</h3>
                  <p className="text-muted-foreground text-sm">{employer.bio}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="text-accent" size={16} fill="currentColor" />
                      <span className="font-semibold text-foreground">{employer.rating}</span>
                    </div>
                    <span className="text-muted-foreground">{employer.completedJobs} jobs completed</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition"
              >
                Contact
              </motion.button>
            </div>
          </div>

          {/* Apply Button */}
          {currentUser?.role === 'worker' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              disabled={isApplying}
              className="w-full py-4 px-6 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition disabled:opacity-50 shadow-lg"
            >
              {isApplying ? 'Applying...' : 'Apply for This Job'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
