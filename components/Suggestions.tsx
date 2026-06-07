'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function Suggestions() {
  const { setCurrentPage } = useAppStore()
  const [suggestion, setSuggestion] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (suggestion.trim()) {
      setSubmitted(true)
      setSuggestion('')
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground p-6 pt-8">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center gap-2 mb-6 hover:opacity-80 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">Send Feedback</h1>
          <p className="text-accent-foreground/80">Help us improve Butsó</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-lg border border-border p-6 sm:p-8"
        >
          <p className="text-muted-foreground mb-6">
            Your feedback is valuable to us. Please share your suggestions, bug reports, or feature ideas to help us make Butsó better.
          </p>

          {submitted && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-primary/15 text-primary border border-primary/30 rounded-lg p-4 mb-6"
            >
              Thank you for your feedback! We appreciate your input and will review it shortly.
            </motion.div>
          )}

          <div className="mb-6">
            <label className="block text-foreground font-semibold mb-3">Your Feedback</label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Tell us what you think... (minimum 10 characters)"
              className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={6}
              maxLength={1000}
            />
            <p className="text-muted-foreground text-sm mt-2">
              {suggestion.length}/1000 characters
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={suggestion.trim().length < 10}
              className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Submit Feedback
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="w-full bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition"
            >
              Skip
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border border-border p-6 mt-8"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Types of Feedback We're Looking For</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Feature ideas and suggestions for improvement</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Bug reports and issues you've encountered</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>User experience improvements</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>General comments and feedback</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  )
}
