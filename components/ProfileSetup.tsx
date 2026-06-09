'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronRight, Briefcase, HardHat } from 'lucide-react'
import { useState } from 'react'
import { useAppStore, type UserRole } from '@/lib/store'
import { mockJobs, mockBookings, mockNotifications, mockTransactions } from '@/lib/mockData'

const SUGGESTED_SKILLS = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
  'Construction', 'Welding', 'Tiling', 'Roofing', 'Gardening',
  'Cooking', 'Auto Repair', 'Generator Repair', 'AC Repair', 'Security'
]

export function ProfileSetup() {
  const { setCurrentPage, setCurrentUser, setJobs, setBookings, setNotifications, setTransactions } = useAppStore()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'basic' | 'skills'>('basic')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  const role = (sessionStorage.getItem('selectedRole') === 'find-work' ? 'worker' : sessionStorage.getItem('selectedRole') as UserRole) || 'worker'
  const phone = sessionStorage.getItem('userPhone') || ''

  const isLookingForWork = role === 'worker'

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill))
    } else if (skills.length < 6) {
      setSkills([...skills, skill])
    }
  }

  const addCustomSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed) && skills.length < 6) {
      setSkills([...skills, trimmed])
      setSkillInput('')
    }
  }

  const handleBasicSubmit = () => {
    if (!name.trim()) return
    // Skills step only for people looking for work
    if (isLookingForWork) {
      setStep('skills')
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        phone,
        name: name.trim(),
        role,
        bio: bio.trim() || undefined,
        skills: isLookingForWork && skills.length > 0 ? skills : undefined,
        rating: 5,
        completedJobs: 0,
      }
      setCurrentUser(newUser)

      // Inject all mock data so every screen has content to show
      setJobs(mockJobs)
      setBookings(mockBookings)
      setNotifications(mockNotifications)
      setTransactions(mockTransactions)

      sessionStorage.removeItem('selectedRole')
      sessionStorage.removeItem('userPhone')

      setCurrentPage('dashboard')
      setIsLoading(false)
    }, 900)
  }

  const progressSteps = isLookingForWork ? 2 : 1
  const currentStepIndex = step === 'basic' ? 0 : 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <button
            onClick={() => setCurrentPage('splash')}
            className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">B</span>
            </div>
            <span className="text-xl font-black text-foreground">Butsó</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: progressSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= currentStepIndex ? 'bg-primary' : 'bg-border'
                }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Basic Info ── */}
          {step === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                  {isLookingForWork
                    ? <HardHat className="text-primary" size={28} />
                    : <Briefcase className="text-primary" size={28} />
                  }
                </div>
                <h1 className="text-2xl font-black text-foreground mb-1">
                  {isLookingForWork ? 'Set Up Your Worker Profile' : 'Set Up Your Account'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isLookingForWork
                    ? 'Employers will see this when you apply for jobs'
                    : 'Just your name is enough to get started'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chukwu Okonkwo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleBasicSubmit()}
                  autoFocus
                  className="w-full px-4 py-3.5 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 transition text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-1">
                  Short Bio <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  {isLookingForWork
                    ? 'One sentence about your experience — e.g. "5 years plumbing, based in Wukari"'
                    : 'Optional — tell workers a little about what you need help with'}
                </p>
                <textarea
                  placeholder={isLookingForWork
                    ? 'e.g. Experienced plumber available for residential and commercial jobs'
                    : 'e.g. Looking for reliable workers for home renovation projects'
                  }
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 150))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 resize-none transition text-sm"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{bio.length}/150</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleBasicSubmit}
                disabled={!name.trim()}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-base"
              >
                {isLookingForWork ? 'Next: Add Skills' : 'Create Account'}
                <ChevronRight size={20} />
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Skills (find-work only) ── */}
          {step === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                  <span className="text-3xl">🛠️</span>
                </div>
                <h1 className="text-2xl font-black text-foreground mb-1">What can you do?</h1>
                <p className="text-muted-foreground text-sm">
                  Pick your skills so employers can find you. Pick up to 6.
                </p>
              </div>

              {/* Suggested skill chips */}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map(skill => (
                  <motion.button
                    key={skill}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${skills.includes(skill)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary border border-border text-foreground hover:border-primary/50'
                      } ${!skills.includes(skill) && skills.length >= 6 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>

              {/* Custom skill input */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                  Add a custom skill
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Bricklaying"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                    className="flex-1 px-4 py-2.5 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 transition text-sm"
                  />
                  <button
                    onClick={addCustomSkill}
                    disabled={!skillInput.trim() || skills.length >= 6}
                    className="px-4 py-2.5 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition disabled:opacity-40 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected count */}
              <p className="text-sm text-muted-foreground text-center">
                {skills.length === 0
                  ? 'No skills selected yet'
                  : `${skills.length} skill${skills.length > 1 ? 's' : ''} selected`}
              </p>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : skills.length === 0 ? 'Skip for now' : 'Complete Setup'}
              </motion.button>

              <button
                onClick={() => setStep('basic')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition py-2"
              >
                ← Back
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}