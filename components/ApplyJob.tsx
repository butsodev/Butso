'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CheckCircle, Zap, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

type ApplyMode = 'choose' | 'quick' | 'detailed' | 'success'

export function ApplyJob() {
  const { setCurrentPage, currentUser } = useAppStore()
  const [mode, setMode] = useState<ApplyMode>('choose')
  const [isLoading, setIsLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)

  // Only fields that are genuinely useful for local trade workers
  const [availability, setAvailability] = useState('immediate')
  const [expectedRate, setExpectedRate] = useState('')
  const [message, setMessage] = useState('')

  const handleQuickApply = () => {
    setIsLoading(true)
    setTimeout(() => {
      setMode('success')
      setIsLoading(false)
    }, 900)
  }

  const handleDetailedApply = () => {
    setIsLoading(true)
    setTimeout(() => {
      setMode('success')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      {mode !== 'success' && (
        <div className="bg-background border-b border-border sticky top-0 z-30">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => mode === 'choose' ? setCurrentPage('jobs') : setMode('choose')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Back</span>
            </motion.button>
            <h1 className="text-xl font-black text-foreground">Apply for Job</h1>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">

          {/* ─── PHASE 2: Choose Apply Mode ─────────────────────── */}
          {mode === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Job Summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-4 mb-8">
                <div className="text-3xl">🏗️</div>
                <div className="flex-1">
                  <h3 className="font-black text-foreground text-lg">Bathroom Renovation</h3>
                  <p className="text-muted-foreground text-sm">₦250,000 · Central Wukari · Posted 2 days ago</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-foreground mb-2">How do you want to apply?</h2>
              <p className="text-muted-foreground mb-6">Choose whatever feels right. You can always message the employer after.</p>

              {/* PHASE 2 FIX: Quick Apply — one tap, just your profile */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode('quick')}
                className="w-full bg-primary text-primary-foreground rounded-2xl p-5 mb-4 text-left hover:bg-primary/90 transition shadow-md shadow-primary/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-xl mt-0.5">
                    <Zap size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-lg">Quick Apply</h3>
                      <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Apply instantly with your profile. No writing needed. Perfect for most jobs.
                    </p>
                  </div>
                </div>
              </motion.button>

              {/* PHASE 2 FIX: Detailed Apply — optional, not forced */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode('detailed')}
                className="w-full bg-card border-2 border-border rounded-2xl p-5 text-left hover:border-primary/40 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl mt-0.5">
                    <FileText size={22} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-foreground mb-1">Add a Message</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Want to say something specific? Add your availability or a short note. It's all optional.
                    </p>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* ─── PHASE 2: Quick Apply Confirm ───────────────────── */}
          {mode === 'quick' && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-4 mb-8">
                <div className="text-3xl">🏗️</div>
                <div>
                  <h3 className="font-black text-foreground">Bathroom Renovation</h3>
                  <p className="text-sm text-muted-foreground">₦250,000 · Central Wukari</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-foreground mb-1">Ready to apply?</h2>
              <p className="text-muted-foreground mb-6">Your profile will be sent to the employer right away.</p>

              {/* Profile preview */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Your Profile</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                    👷
                  </div>
                  <div>
                    <p className="font-black text-foreground text-lg">{currentUser?.name || 'Your Name'}</p>
                    <p className="text-muted-foreground text-sm">{currentUser?.phone}</p>
                    {currentUser?.skills && currentUser.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {currentUser.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {currentUser?.rating && (
                      <p className="text-sm mt-1">⭐ {currentUser.rating} · {currentUser.completedJobs || 0} jobs done</p>
                    )}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleQuickApply}
                disabled={isLoading}
                className="w-full py-4 bg-primary text-primary-foreground font-black text-lg rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Send Application
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* ─── PHASE 2: Detailed Apply (all optional except availability) ── */}
          {mode === 'detailed' && (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-4 mb-8">
                <div className="text-3xl">🏗️</div>
                <div>
                  <h3 className="font-black text-foreground">Bathroom Renovation</h3>
                  <p className="text-sm text-muted-foreground">₦250,000 · Central Wukari</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-foreground mb-1">Tell them a little more</h2>
              <p className="text-muted-foreground mb-6">Everything here is optional. Just fill what applies to you.</p>

              <div className="space-y-5">
                {/* Availability — only required field, but it's a simple dropdown */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    When can you start?
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground bg-background transition"
                  >
                    <option value="immediate">I can start immediately</option>
                    <option value="1week">Within 1 week</option>
                    <option value="2weeks">Within 2 weeks</option>
                    <option value="flexible">I'm flexible</option>
                  </select>
                </div>

                {/* Optional message — not a "cover letter", just a message */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1">
                    Short message <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    A sentence or two is fine. No need to write an essay.
                  </p>
                  <textarea
                    placeholder="e.g. I've done this kind of work before and I'm available this week."
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 resize-none transition"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{message.length}/200</p>
                </div>

                {/* "More options" toggle — rate hidden behind it so it's not overwhelming */}
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showMore ? 'Less options' : 'More options (rate, etc.)'}
                </button>

                <AnimatePresence>
                  {showMore && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">
                          Expected daily rate (₦) <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Leave blank to negotiate"
                          value={expectedRate}
                          onChange={(e) => setExpectedRate(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 transition"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Profile reminder */}
                <div className="bg-secondary/50 border border-border rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl shrink-0">
                    👷
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{currentUser?.name || 'Your Name'}</p>
                    <p className="text-xs text-muted-foreground">Your profile will be included automatically</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleDetailedApply}
                  disabled={isLoading}
                  className="w-full py-4 bg-primary text-primary-foreground font-black text-lg rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Application'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Success ─────────────────────────────────────────── */}
          {mode === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 px-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6"
              >
                <CheckCircle className="text-primary" size={48} />
              </motion.div>

              <h2 className="text-3xl font-black text-foreground mb-2">Application Sent! 🎉</h2>
              <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                The employer will see your profile and get back to you soon.
              </p>

              <div className="bg-card border border-border rounded-2xl p-5 mb-8 text-left">
                <p className="font-bold text-foreground mb-3 text-sm">What happens next:</p>
                <ul className="space-y-3 text-sm">
                  {[
                    'Employer reviews your profile',
                    "You'll get a notification if they're interested",
                    'Chat directly to agree on terms',
                    'Start the job and get paid!',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground">
                      <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage('dashboard')}
                  className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition"
                >
                  Go to Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage('jobs')}
                  className="flex-1 py-3 px-6 border-2 border-border text-foreground font-bold rounded-xl hover:border-primary/40 transition"
                >
                  Browse More Jobs
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}