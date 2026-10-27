'use client'

import { AmountInput } from '@/components/AmountInput'
import { motion } from 'framer-motion'
import { shareLink } from '@/lib/share'
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
import { WUKARI_AREAS } from '@/lib/areas'
import { isJobSaved, setJobSaved } from '@/lib/dataSaved'
import { updateJobDetails, setJobOpen, deleteJob } from '@/lib/dataJobsManage'

export function JobDetails() {
  const { setCurrentPage, jobs, jobsStatus, selectedJobId, currentUser } = useAppStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [employer, setEmployer] = useState<PublicProfile | null>(null)
  const [invite, setInvite] = useState<JobInvite | null>(null)
  const [answering, setAnswering] = useState(false)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', budget: '', location: '' })

  // Saved jobs persist per account
  useEffect(() => {
    if (!selectedJobId || !currentUser) { setIsFavorite(false); return }
    let cancelled = false
    isJobSaved(currentUser.id, selectedJobId).then(v => { if (!cancelled) setIsFavorite(v) })
    return () => { cancelled = true }
  }, [selectedJobId, currentUser?.id])

  const toggleSaved = async () => {
    if (!currentUser) { useAppStore.getState().openAuth('login'); return }
    if (!selectedJobId) return
    const next = !isFavorite
    setIsFavorite(next) // optimistic
    const err = await setJobSaved(currentUser.id, selectedJobId, next)
    if (err) { setIsFavorite(!next); showToast('error', err) }
    else showToast('success', next ? 'Job saved' : 'Removed from saved')
  }

  const startEdit = () => {
    if (!job) return
    setForm({ title: job.title, description: job.description, budget: String(job.budget), location: job.location })
    setEditing(true)
  }
  const saveEdit = async () => {
    if (!job) return
    const budget = Number(form.budget)
    if (!form.title.trim() || !form.description.trim() || !budget || budget < 0) {
      showToast('error', 'Fill in the title, description and a valid budget.'); return
    }
    setBusy(true)
    const err = await updateJobDetails(job.id, { title: form.title.trim(), description: form.description.trim(), budget, location: form.location })
    if (err) { setBusy(false); showToast('error', err); return }
    await refreshJobs()
    setBusy(false); setEditing(false)
    showToast('success', 'Job updated')
  }
  const toggleClosed = async () => {
    if (!job) return
    setBusy(true)
    const err = await setJobOpen(job.id, job.status !== 'open')
    if (err) { setBusy(false); showToast('error', err); return }
    await refreshJobs()
    setBusy(false)
    showToast('success', job.status === 'open' ? 'Job closed. It is hidden from the jobs list.' : 'Job reopened')
  }
  const removeJob = async () => {
    if (!job) return
    if (!window.confirm('Delete this job for good? This cannot be undone.')) return
    setBusy(true)
    const err = await deleteJob(job.id)
    if (err) { setBusy(false); showToast('error', err); return }
    await refreshJobs()
    setBusy(false)
    showToast('success', 'Job deleted')
    setCurrentPage('dashboard')
  }

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
              onClick={toggleSaved}
              className={`p-2 rounded-lg transition ${isFavorite
                ? 'bg-destructive/15 text-destructive'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button aria-label="Share job"
              onClick={async () => {
                const r = await shareLink({ path: `/jobs/${job.id}`, title: `${job.title} | Job on Butsó`, text: `${job.title} on Butsó.` })
                if (r === 'copied') showToast('success', 'Link copied')
              }}
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

          {isOwnJob && (
            <div className="space-y-2">
              {job.status !== 'open' && (
                <p className="text-sm font-bold text-muted-foreground text-center">
                  {job.status === 'cancelled' ? 'This job is closed.' : job.status === 'in-progress' ? 'Someone is hired for this job.' : 'This job is finished.'}
                </p>
              )}
              <div className="flex gap-2">
                {(job.status === 'open' || job.status === 'cancelled') && (
                  <button onClick={startEdit} disabled={busy}
                    className="flex-1 py-3 border border-border text-foreground font-bold rounded-lg hover:bg-secondary transition disabled:opacity-50">Edit</button>
                )}
                {(job.status === 'open' || job.status === 'cancelled') && (
                  <button onClick={toggleClosed} disabled={busy}
                    className="flex-1 py-3 border border-border text-foreground font-bold rounded-lg hover:bg-secondary transition disabled:opacity-50">
                    {job.status === 'open' ? 'Close job' : 'Reopen'}
                  </button>
                )}
                {!job.selectedWorkerId && (
                  <button onClick={removeJob} disabled={busy}
                    className="flex-1 py-3 border border-destructive/40 text-destructive font-bold rounded-lg hover:bg-destructive/10 transition disabled:opacity-50">Delete</button>
                )}
              </div>
            </div>
          )}

          {!isOwnJob && currentUser?.role === 'worker' && job.status === 'open' && (
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
      {editing && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-end sm:items-center justify-center p-4 pb-24 sm:pb-4" onClick={() => setEditing(false)}>
          <div role="dialog" aria-label="Edit job" onClick={e => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[75vh] overflow-y-auto p-5 space-y-3">
            <h2 className="text-lg font-black text-foreground">Edit job</h2>
            <input aria-label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground" />
            <textarea aria-label="Description" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground" />
            <AmountInput aria-label="Budget" value={form.budget} onChange={v => setForm({ ...form, budget: v })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground" />
            <select aria-label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground">
              {!WUKARI_AREAS.includes(form.location as never) && <option>{form.location}</option>}
              {WUKARI_AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 border border-border font-bold rounded-lg">Cancel</button>
              <button onClick={saveEdit} disabled={busy} className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-50">
                {busy ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}