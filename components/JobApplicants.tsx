'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, MessageCircle, ChevronLeft } from 'lucide-react'
import { RatingBadge } from '@/components/Rating'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore, goBackTo } from '@/lib/store'
import { fetchApplicants, setApplicationStatus, type Applicant } from '@/lib/dataApplications'
import { createBooking, refreshBookings } from '@/lib/dataBookings'
import { refreshJobs, timeAgo } from '@/lib/data'
import { showToast } from '@/lib/toast'

import { EmojiIcon } from '@/components/EmojiIcon'

type Filter = 'all' | 'pending' | 'accepted' | 'rejected'

export function JobApplicants() {
  const { currentUser, jobs, selectedJobId, setCurrentPage, openChatWith } = useAppStore()
  const job = jobs.find(j => j.id === selectedJobId)

  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null)
  const [appliedFilter, setAppliedFilter] = useState<Filter>('all')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!job) return
    setLoading(true); setLoadError('')
    const { applicants: list, error } = await fetchApplicants(job.id)
    if (error) setLoadError('Could not load applicants. Please try again.')
    else setApplicants(list)
    setLoading(false)
  }, [job?.id])

  useEffect(() => { void load() }, [load])

  const decide = async (a: Applicant, status: 'accepted' | 'rejected') => {
    if (!job || busy) return
    setBusy(true)
    const err = await setApplicationStatus(a.id, status, job.id, a.workerId)
    setBusy(false)
    if (err) { showToast('error', 'Could not update this applicant. Please try again.'); return }
    setApplicants(prev => prev.map(x => x.id === a.id ? { ...x, status } : x))
    showToast('success', status === 'accepted' ? `${a.name} accepted` : `${a.name} rejected`)
    refreshJobs()
  }

  const createJobBooking = async (a: Applicant) => {
    if (!job || !currentUser || busy) return
    setBusy(true)
    const { error } = await createBooking({
      type: 'job',
      jobId: job.id,
      jobTitle: job.title,
      workerId: a.workerId,
      workerName: a.name,
      employerId: currentUser.id,
      employerName: currentUser.name,
      date: (job.deadline ? job.deadline.slice(0, 10) : new Date().toISOString().slice(0, 10)),
      slots: [],
      totalPrice: job.budget,
    })
    setBusy(false)
    if (error) { showToast('error', 'Could not create the booking. Please try again.'); return }
    void refreshBookings(currentUser.id)
    showToast('success', 'Booking created')
    setCurrentPage('bookings')
  }

  if (!job || !currentUser || job.employerId !== currentUser.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-foreground font-bold mb-2">No job selected</p>
          <button onClick={() => setCurrentPage('dashboard')} className="text-primary font-semibold">Back to dashboard</button>
        </div>
      </div>
    )
  }

  const filteredApplicants = appliedFilter === 'all'
    ? applicants
    : applicants.filter(a => a.status === appliedFilter)

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
              onClick={() => goBackTo('dashboard')}
              className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition font-semibold"
            >
              <ChevronLeft size={20} />
              Back
            </motion.button>
          </div>
          <h1 className="text-3xl font-bold">Job Applicants</h1>
          <p className="text-primary-foreground/80">{job.title} • ₦{job.budget.toLocaleString()}</p>
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
                {(['all', 'pending', 'accepted', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAppliedFilter(filter)}
                    className={`flex-1 py-3 px-2 text-xs sm:text-sm font-semibold transition border-b-2 ${appliedFilter === filter
                      ? 'border-accent text-accent bg-accent/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'pending' ? 'New' : filter === 'accepted' ? 'Accepted' : 'Rejected'}
                    {` (${filter === 'all' ? applicants.length : applicants.filter(a => a.status === filter).length})`}
                  </button>
                ))}
              </div>

              {/* Applicants List */}
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {loading && <div className="p-6 text-center text-sm text-muted-foreground">Loading applicants…</div>}
                {!loading && loadError && (
                  <div className="p-6 text-center text-sm">
                    <p className="text-destructive mb-2">{loadError}</p>
                    <button onClick={() => void load()} className="text-primary font-semibold">Try again</button>
                  </div>
                )}
                {!loading && !loadError && filteredApplicants.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    {applicants.length === 0 ? 'No one has applied yet.' : 'No applicants in this tab.'}
                  </div>
                )}
                {filteredApplicants.map((applicant, index) => (
                  <motion.button
                    key={applicant.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => setSelectedApplicant(applicant.id)}
                    className={`w-full text-left p-4 hover:bg-secondary/50 transition ${selectedApplicant === applicant.id ? 'bg-primary/5 border-r-4 border-accent' : ''
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
                      {applicant.rating != null ? <RatingBadge value={applicant.rating} size="xs" /> : <span className="text-xs text-muted-foreground">No reviews</span>}
                      <span className="text-xs text-muted-foreground">• {applicant.completedJobs} jobs</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{timeAgo(applicant.createdAt)}</p>
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
                      <div className="text-5xl"><EmojiIcon e="👷" size={44} /></div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{selectedData.name}</h2>
                        <p className="text-muted-foreground text-sm">{selectedData.bio || `@${selectedData.username}`}</p>
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
                        {selectedData.rating != null ? <RatingBadge value={selectedData.rating} size="md" /> : <span className="text-sm text-muted-foreground">No reviews yet</span>}
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
                  <h3 className="text-lg font-bold text-foreground mb-4">Message</h3>
                  <p className="text-foreground leading-relaxed">{selectedData.message || 'No message. They applied with their profile only.'}</p>
                  {(selectedData.availability || selectedData.expectedRate != null) && (
                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
                      {selectedData.availability && (
                        <div><p className="text-xs text-muted-foreground mb-1">Availability</p><p className="font-semibold text-foreground capitalize">{selectedData.availability.replace(/-/g, ' ')}</p></div>
                      )}
                      {selectedData.expectedRate != null && (
                        <div><p className="text-xs text-muted-foreground mb-1">Expected daily rate</p><p className="font-semibold text-foreground">₦{selectedData.expectedRate.toLocaleString()}</p></div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedData.status === 'pending' && (
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => void decide(selectedData, 'accepted')}
                      disabled={busy}
                      className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle size={20} />
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openChatWith({ userId: selectedData.workerId, name: selectedData.name, context: job.title })}
                      className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Message
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => void decide(selectedData, 'rejected')}
                      disabled={busy}
                      className="flex-1 py-3 px-6 border border-destructive/30 text-destructive font-semibold rounded-lg hover:bg-destructive/10 transition disabled:opacity-50"
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
                      onClick={() => openChatWith({ userId: selectedData.workerId, name: selectedData.name, context: job.title })}
                      className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Message
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => void createJobBooking(selectedData)}
                      disabled={busy}
                      className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition disabled:opacity-50"
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