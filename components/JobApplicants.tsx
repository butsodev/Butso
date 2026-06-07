'use client'

import { motion } from 'framer-motion'
import { Star, CheckCircle, XCircle, MessageCircle, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function JobApplicants() {
  const { setCurrentPage } = useAppStore()
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null)
  const [appliedFilter, setAppliedFilter] = useState<'all' | 'accepted' | 'rejected'>('all')

  // Sample applicants data
  const applicants = [
    {
      id: '1',
      name: 'Chukwu Okonkwo',
      rating: 4.9,
      completedJobs: 23,
      bio: 'Professional carpenter with 5+ years experience',
      skills: ['Carpentry', 'Painting', 'Repairs'],
      coverLetter: 'I have successfully completed similar bathroom renovation projects with excellent results. My attention to detail and quality workmanship guarantee customer satisfaction.',
      status: 'pending' as const,
      appliedDate: '2 hours ago',
    },
    {
      id: '2',
      name: 'Amara Adebayo',
      rating: 4.7,
      completedJobs: 15,
      bio: 'Experienced in construction and renovation',
      skills: ['Tiling', 'Construction', 'Finishing'],
      coverLetter: 'I specialize in bathroom renovations and have done 10+ similar projects in the past year.',
      status: 'accepted' as const,
      appliedDate: '4 hours ago',
    },
    {
      id: '3',
      name: 'Tunde Oluwaseun',
      rating: 4.5,
      completedJobs: 8,
      bio: 'Growing professional, eager to learn',
      skills: ['Plumbing', 'General Repairs'],
      coverLetter: 'Enthusiastic about this project. I have relevant experience and can start immediately.',
      status: 'pending' as const,
      appliedDate: '6 hours ago',
    },
    {
      id: '4',
      name: 'Blessing Ezeoke',
      rating: 3.2,
      completedJobs: 2,
      bio: 'Trainee professional',
      skills: ['General Labor', 'Painting'],
      coverLetter: 'I am eager to gain more experience in construction work.',
      status: 'rejected' as const,
      appliedDate: '1 day ago',
    },
  ]

  const filteredApplicants = appliedFilter === 'all' 
    ? applicants 
    : applicants.filter(a => a.status === appliedFilter.slice(0, -1))

  const selectedData = selectedApplicant 
    ? applicants.find(a => a.id === selectedApplicant)
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-accent/80 text-primary-foreground p-6 pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-2">
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition font-semibold"
            >
              <ChevronLeft size={20} />
              Back
            </motion.button>
          </div>
          <h1 className="text-3xl font-bold">Job Applicants</h1>
          <p className="text-primary-foreground/80">Bathroom Renovation • ₦250,000</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applicants List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-lg border border-border shadow-sm overflow-hidden"
            >
              {/* Filter Tabs */}
              <div className="flex border-b border-border">
                {(['all', 'accepted', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAppliedFilter(filter)}
                    className={`flex-1 py-3 px-4 text-sm font-semibold transition border-b-2 ${
                      appliedFilter === filter
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'accepted' ? 'Accepted' : 'Rejected'}
                    {filter === 'all' && ` (${applicants.length})`}
                    {filter === 'accepted' && ` (${applicants.filter(a => a.status === 'accept').length})`}
                    {filter === 'rejected' && ` (${applicants.filter(a => a.status === 'reject').length})`}
                  </button>
                ))}
              </div>

              {/* Applicants List */}
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {filteredApplicants.map((applicant, index) => (
                  <motion.button
                    key={applicant.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => setSelectedApplicant(applicant.id)}
                    className={`w-full text-left p-4 hover:bg-secondary/50 transition ${
                      selectedApplicant === applicant.id ? 'bg-primary/5 border-r-4 border-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-foreground text-sm">{applicant.name}</h3>
                      {applicant.status === 'accepted' && (
                        <CheckCircle className="text-primary" size={16} />
                      )}
                      {applicant.status === 'rejected' && (
                        <XCircle className="text-destructive" size={16} />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="text-accent" size={12} fill="currentColor" />
                      <span className="text-xs font-semibold text-foreground">{applicant.rating}</span>
                      <span className="text-xs text-muted-foreground">• {applicant.completedJobs} jobs</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{applicant.appliedDate}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Applicant Details */}
          <div className="lg:col-span-2">
            {selectedData ? (
              <motion.div
                key={selectedData.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Profile Card */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">👷</div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{selectedData.name}</h2>
                        <p className="text-muted-foreground text-sm">{selectedData.bio}</p>
                      </div>
                    </div>
                    {selectedData.status === 'pending' && (
                      <span className="px-3 py-1 bg-accent/15 text-accent text-xs font-semibold rounded-full">
                        Pending
                      </span>
                    )}
                    {selectedData.status === 'accepted' && (
                      <span className="px-3 py-1 bg-primary/15 text-primary text-xs font-semibold rounded-full">
                        Accepted
                      </span>
                    )}
                    {selectedData.status === 'rejected' && (
                      <span className="px-3 py-1 bg-destructive/15 text-destructive text-xs font-semibold rounded-full">
                        Rejected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rating</p>
                      <div className="flex items-center gap-2">
                        <Star className="text-accent" size={16} fill="currentColor" />
                        <span className="font-bold text-lg text-foreground">{selectedData.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Completed Jobs</p>
                      <p className="font-bold text-lg text-foreground">{selectedData.completedJobs}</p>
                    </div>
                  </div>

                  {selectedData.skills && selectedData.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedData.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Cover Letter</h3>
                  <p className="text-foreground leading-relaxed">{selectedData.coverLetter}</p>
                </div>

                {/* Action Buttons */}
                {selectedData.status === 'pending' && (
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Message
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-6 border border-destructive/30 text-destructive font-semibold rounded-lg hover:bg-destructive/10 transition"
                    >
                      Reject
                    </motion.button>
                  </div>
                )}

                {selectedData.status === 'accepted' && (
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Message
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
                    >
                      Create Booking
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <p className="text-muted-foreground">Select an applicant to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
