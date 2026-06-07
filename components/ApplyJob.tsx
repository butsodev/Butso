'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function ApplyJob() {
  const { setCurrentPage, currentUser } = useAppStore()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolio: '',
    availability: 'immediate',
    expectedRate: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.coverLetter.trim()) {
      alert('Please write a cover letter')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setStep('success')
      setIsLoading(false)
    }, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          {step === 'form' && (
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('jobs')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition font-semibold"
            >
              <ChevronLeft size={20} />
              Back
            </motion.button>
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {step === 'form' ? 'Apply for Job' : 'Application Sent'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {step === 'form' ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Progress */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">Step 1 of 2: Your Application</h2>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-4">
                <div className="text-3xl">🏗️</div>
                <div>
                  <h3 className="font-bold text-foreground">Bathroom Renovation</h3>
                  <p className="text-sm text-muted-foreground">₦250,000 • Central Wukari</p>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cover Letter *
                </label>
                <textarea
                  name="coverLetter"
                  placeholder="Tell the employer why you&apos;re the perfect fit for this job..."
                  value={formData.coverLetter}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.coverLetter.length}/500 characters
                </p>
              </div>

              {/* Portfolio Link */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Portfolio or Previous Work Link (Optional)
                </label>
                <input
                  type="url"
                  name="portfolio"
                  placeholder="https://your-portfolio.com or link to past work"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  When can you start? *
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-white"
                >
                  <option value="immediate">Immediately</option>
                  <option value="1week">Within 1 week</option>
                  <option value="2weeks">Within 2 weeks</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              {/* Expected Rate */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Expected Daily Rate (₦) (Optional)
                </label>
                <input
                  type="number"
                  name="expectedRate"
                  placeholder="Leave blank to negotiate"
                  value={formData.expectedRate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Worker Info Display */}
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Your Profile:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{currentUser?.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser?.phone}</p>
                  {currentUser?.rating && (
                    <p className="text-sm">
                      ⭐ {currentUser.rating} • {currentUser.completedJobs || 0} jobs completed
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {isLoading ? 'Sending Application...' : 'Submit Application'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setCurrentPage('jobs')}
                  className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Success State */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="inline-block mb-6"
            >
              <CheckCircle className="text-primary" size={64} />
            </motion.div>

            <h2 className="text-3xl font-bold text-foreground mb-2">Application Sent!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your application has been sent to the employer. They&apos;ll review your profile and get back to you soon.
            </p>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8 text-left">
              <p className="font-semibold text-foreground mb-3">What happens next?</p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">1.</span>
                  <span>Employer reviews your application</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">2.</span>
                  <span>You&apos;ll be notified if they want to chat</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">3.</span>
                  <span>Discuss details and agree on terms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">4.</span>
                  <span>Create booking and start the job!</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage('dashboard')}
                className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
              >
                Go to Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage('jobs')}
                className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
              >
                Browse More Jobs
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
