'use client'

import { AmountInput } from '@/components/AmountInput'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { WUKARI_AREAS } from '@/lib/areas'
import { useAppStore, goBackTo } from '@/lib/store'
import { createJob } from '@/lib/data'
import { showSuccess } from '@/lib/success'
import { useHireIntent } from '@/lib/hireIntent'
import { sendJobInvite } from '@/lib/dataInvites'
import { showToast } from '@/lib/toast'

export function PostJob() {
  const { currentUser, setCurrentPage, addJob } = useAppStore()
  const hireTarget = useHireIntent(s => s.target)
  // Leaving this screen cancels "post a job for this person"
  useEffect(() => () => useHireIntent.getState().setTarget(null), [])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Construction',
    budget: '',
    location: '',
    deadline: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['Construction', 'Plumbing', 'Electrical', 'Cleaning', 'Repairs', 'Other']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const budget = Number(formData.budget)
    if (!formData.title.trim() || !formData.description.trim() || !budget) {
      setError('Please fill in the title, description and budget.')
      return
    }
    if (budget < 0) { setError('Budget cannot be negative.'); return }
    if (!currentUser) { setError('You appear to be signed out. Please log in again.'); return }

    setIsLoading(true)
    const { job, error: saveError } = await createJob({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      budget,
      location: formData.location.trim() || 'Not specified',
      employerId: currentUser.id,
      deadline: formData.deadline || undefined,
    })
    setIsLoading(false)
    if (saveError || !job) { setError(saveError ?? 'Could not post the job. Try again.'); return }
    addJob(job)
    // Posted from someone's profile: invite that person to this new job
    const target = useHireIntent.getState().target
    let invitedName: string | null = null
    if (target) {
      useHireIntent.getState().setTarget(null)
      const inviteError = await sendJobInvite(job.id, target.id)
      if (inviteError) showToast('error', `Job posted, but the invite failed: ${inviteError}`)
      else invitedName = target.name
    }
    setCurrentPage('dashboard')
    showSuccess({
      title: 'Your job is live',
      message: invitedName
        ? `${invitedName} has been invited. Other workers can see it and apply too.`
        : 'Workers can see it now and apply. We will notify you when someone does.',
      actionLabel: 'Got it',
    })
  }

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
          className="max-w-4xl mx-auto"
        >
          <button
            onClick={() => goBackTo('dashboard')}
            className="mb-4 flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition font-semibold"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold mb-1">Post a New Job</h1>
          <p className="text-primary-foreground/80">Describe the work you need done</p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-8">
        {hireTarget && (
          <div className="mb-3 bg-card border border-primary/30 rounded-2xl p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-foreground">This job will also be sent to <span className="font-black">{hireTarget.name}</span>.</p>
            <button type="button" onClick={() => useHireIntent.getState().setTarget(null)}
              className="text-sm font-bold text-primary hover:underline shrink-0">Remove</button>
          </div>
        )}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-card rounded-lg border border-border shadow-sm p-8 mt-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Job Title *
            </label>
            <input aria-label="Job title"
              type="text"
              name="title"
              placeholder="e.g., Bathroom Renovation"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Job Description *
            </label>
            <textarea aria-label="Job description"
              name="description"
              placeholder="Describe the work in detail"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Category *
            </label>
            <select aria-label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground bg-card"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Budget (₦) *
            </label>
            <AmountInput aria-label="Budget in naira"
              name="budget"
              placeholder="Enter budget in Naira"
              value={formData.budget}
              onChange={v => setFormData(prev => ({ ...prev, budget: v }))}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Location
            </label>
            <select aria-label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground bg-card"
            >
              {WUKARI_AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Deadline (Optional)
            </label>
            <input aria-label="Deadline (optional)"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Publishing...' : 'Publish Job'}
              {!isLoading && <ChevronRight size={20} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setCurrentPage('dashboard')}
              className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
            >
              Cancel
            </motion.button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  )
}
