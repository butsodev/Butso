'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Star, MapPin, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function UserProfile() {
  const { setCurrentPage, currentUser } = useAppStore()
  const [copied, setCopied] = useState(false)

  if (!currentUser) return null

  const generateUsername = (name: string, id: string) => {
    return `${name.toLowerCase().replace(/\s+/g, '')}_${id.slice(0, 6)}`
  }

  const username = generateUsername(currentUser.name, currentUser.id)

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 pt-8">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center gap-2 mb-6 hover:opacity-80 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-lg border border-border p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-primary">{currentUser.name[0]}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{currentUser.name}</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-muted-foreground font-mono text-sm">@{username}</span>
                <button
                  onClick={handleCopyUsername}
                  className="p-1 hover:bg-secondary rounded transition"
                  title="Copy username"
                >
                  {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star size={16} className="text-accent" fill="currentColor" />
                <span className="font-semibold">{((currentUser.rating ?? 5).toFixed(1))}</span>
                <span>({currentUser.completedJobs} jobs completed)</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-bold text-foreground mb-4">About</h3>
            <p className="text-muted-foreground mb-6">{currentUser.bio || 'No bio added yet.'}</p>

            {currentUser.skills && (
              <>
                <h3 className="text-lg font-bold text-foreground mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentUser.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{currentUser.completedJobs}</p>
                <p className="text-muted-foreground text-sm">Jobs Completed</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{((currentUser.rating ?? 5).toFixed(1))}</p>
                <p className="text-muted-foreground text-sm">Rating</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{(currentUser.role === 'worker' ? 'Available' : 'Hiring')}</p>
                <p className="text-muted-foreground text-sm">Status</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-6 pt-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Contact</h3>
            <p className="text-muted-foreground text-sm mb-4">
              To protect privacy, contact information is only visible after a connection request is accepted.
            </p>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition">
              Request to Connect
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setCurrentPage('settings')}
          className="w-full bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition"
        >
          Edit Profile
        </motion.button>
      </div>
    </motion.div>
  )
}