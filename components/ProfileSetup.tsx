'use client'

import { motion } from 'framer-motion'
import { User, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAppStore, type UserRole } from '@/lib/store'
import { mockJobs } from '@/lib/mockData'

export function ProfileSetup() {
  const { setCurrentPage, setCurrentUser } = useAppStore()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'basic' | 'skills' | 'complete'>('basic')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  const role = sessionStorage.getItem('selectedRole') as UserRole
  const phone = sessionStorage.getItem('userPhone') || ''

  const addSkill = () => {
    if (skillInput.trim() && skills.length < 5) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleBasicSubmit = () => {
    if (!name.trim()) {
      alert('Please enter your name')
      return
    }
    if (role === 'worker') {
      setStep('skills')
    } else {
      handleProfileComplete()
    }
  }

  const handleSkillsSubmit = () => {
    if (skills.length === 0) {
      alert('Please add at least one skill')
      return
    }
    handleProfileComplete()
  }

  const handleProfileComplete = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        phone,
        name,
        role,
        bio: bio || undefined,
        skills: role === 'worker' ? skills : undefined,
        rating: 5,
        completedJobs: 0,
      }
      setCurrentUser(newUser)
      // Initialize mock jobs
      useAppStore.setState({ jobs: mockJobs })
      sessionStorage.removeItem('selectedRole')
      sessionStorage.removeItem('userPhone')
      setCurrentPage('dashboard')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        {/* Progress Indicator */}
        <div className="flex gap-2 justify-center mb-8">
          {['basic', 'skills', 'complete'].map((s) => (
            role === 'employer' && s === 'skills' ? null : (
              <motion.div
                key={s}
                className={`h-2 flex-1 rounded-full transition ${
                  step === s || (step === 'complete' && s !== 'skills')
                    ? 'bg-primary'
                    : s === 'skills' && role === 'worker'
                    ? 'bg-border'
                    : 'bg-border'
                }`}
              />
            )
          ))}
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <User className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {step === 'basic' ? 'Create Your Profile' : 'Add Your Skills'}
          </h1>
          <p className="text-muted-foreground">
            {step === 'basic'
              ? 'Tell us about yourself'
              : 'What services can you provide?'}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {step === 'basic' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Bio {role === 'employer' && '(Optional)'}
                </label>
                <textarea
                  placeholder={role === 'worker' ? 'Tell employers about yourself' : 'Tell workers about your business'}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>
              <button
                onClick={handleBasicSubmit}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {step === 'skills' && role === 'worker' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Add Skills ({skills.length}/5)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Plumbing, Carpentry"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={addSkill}
                    disabled={!skillInput.trim() || skills.length >= 5}
                    className="px-4 py-3 bg-secondary text-foreground font-semibold rounded-lg hover:bg-secondary/80 transition disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full"
                    >
                      <span className="text-sm font-medium text-primary">{skill}</span>
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-primary hover:text-primary/70 transition"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSkillsSubmit}
                disabled={isLoading || skills.length === 0}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Complete Setup'}
              </button>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
