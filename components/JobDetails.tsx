'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, User, ChevronLeft, Share2, Heart, Briefcase } from 'lucide-react'
import { RatingBadge } from '@/components/Rating'
import { NairaIcon } from '@/components/NairaIcon'
import { EmptyState } from '@/components/EmptyState'
import { useState, useEffect } from 'react'
import { useAppStore, goBackTo } from '@/lib/store'
import { fetchProfile, timeAgo, type PublicProfile } from '@/lib/data'
import { Avatar } from '@/components/Avatar'
import { fetchMyPendingInvite, respondJobInvite, type JobInvite } from '@/lib/dataInvites'
import { refreshJobs } from '@/lib/data'
import { showToast } from '@/lib/toast'

export function JobDetails() {
  const { setCurrentPage, jobs, jobsStatus, selectedJobId, currentUser } = useAppStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [employer, setEmployer] = useState<PublicProfile | null>(null)
  const [invite, setInvite] = useState<JobInvite | null>(null)
  const [answering, setAnswering] = useState(false)

  useEffect(() => {
    if (!selectedJobId || !currentUser) { setInvite(null); return }
    let cancelled = false
    fetchMyPendingInvite(selectedJobId, currentUser.id).then(i => { if (!cancelled) setInvite(i) })
    return () => { cancelled = true }
  }, [selectedJobId, currentUser?.id])

  const answerInvite = async (accept: boolean) => {
    if (!invite) return
    setAnswering(true)
    const { result, error } = await respondJobInvite(invite.id, accept)
    setAnswering(false)
    if (error) { showToast('error', error); return }
    setInvite(null)
    await refreshJobs()
    if (result === 'accepted') { showToast('success', 'You took the job. Check Messages to chat.'); setCurrentPage('messaging') }
    else if (result === 'declined') showToast('info', 'Invite declined.')
    else showToast('error', 'Sorry, this job was filled by someone else.')
  }

  const job = jobs.find(j => j.id === selectedJobId)

  useEffect(() => {
    if (!job) return
    let cancelled = false
    fetchProfile(job.employerId).then(p => { if (!cancelled) setEmployer(p) })
    return () => { cancelled = true }
  }, [job?.employerId])

  const handleApply = () => {
    setIsApplying(true)
    setTimeout(() => {
      setCurrentPage('apply-job')
      setIsApplying(false)
    }, 800)
  }

  if (!job) {
    if (jobsStatus === 'idle' || jobsStatus === 'loading') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-background pb-20">
        <EmptyState
          icon={Briefcase}
          title="This job is no longer available"
          description="It may have been filled or removed."
          action={{ label: 'Browse jobs', onClick: () => setCurrentPage('jobs') }}
        />
      </div>
    )
  }

  const isOwnJob = currentUser?.id === job.employerId

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header with back button */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => goBackTo('jobs')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition font-semibold"
          >
            <ChevronLeft size={20} />
            Back to Jobs
          </motion.button>
          <div className="flex gap-2">
            <motion.button aria-label={isFavorite ? 'Remove from saved jobs' : 'Save job'} aria-pressed={isFavorite}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition ${isFavorite
                ? 'bg-destructive/15 text-destructive'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button aria-label="Share job"
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
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
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
                <Clock className="text-primary" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Posted</p>
                  <p className="font-semibold text-foreground">{timeAgo(job.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="text-accent" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="font-semibold text-foreground">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4">About This Job</h2>
            <p className="text-foreground leading-relaxed mb-4">{job.description}</p>
          </div>

          {/* Employer Card */}
          {employer && (
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">About the Employer</h2>
              <div className="flex items-center gap-4">
                <Avatar name={employer.name} size={56} />
                <div>
                  <h3 className="text-xl font-bold text-foreground">{employer.name}</h3>
                  {employer.bio && <p className="text-muted-foreground text-sm">{employer.bio}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {employer.rating != null
                      ? <RatingBadge value={employer.rating} size="sm" />
                      : <span className="text-muted-foreground">No reviews yet</span>}
                    <span className="text-muted-foreground">{employer.completedJobs} jobs completed</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {invite && !isOwnJob && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="font-black text-foreground mb-1">You were invited to this job</p>
              <p className="text-sm text-muted-foreground mb-3">Accept to take the job. You and the employer will see each other&apos;s contact details.</p>
              <div className="flex gap-3">
                <button onClick={() => answerInvite(true)} disabled={answering}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-50">Accept</button>
                <button onClick={() => answerInvite(false)} disabled={answering}
                  className="flex-1 py-3 border border-border text-foreground font-bold rounded-lg hover:bg-secondary disabled:opacity-50">Decline</button>
              </div>
            </div>
          )}

          {/* Apply Button */}
          {isOwnJob && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage('job-applicants')}
              className="w-full py-4 px-6 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition shadow-lg"
            >
              View applicants ({job.applicants.length})
            </motion.button>
          )}

          {!isOwnJob && currentUser?.role === 'worker' && (
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