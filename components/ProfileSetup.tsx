'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Briefcase, HardHat, Search, X, Check, AtSign } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppStore, generateUsernameFromName, isUsernameAvailable, type UserRole, type AppStore } from '@/lib/store'
import { mockJobs, mockBookings, mockNotifications, mockTransactions, mockShops } from '@/lib/mockData'

/* ─── Master skills list — searchable ───────────────────────────────────── */
export const ALL_SKILLS = [
  'Plumbing', 'Pipe Fitting', 'Electrical', 'Solar Installation', 'Generator Repair',
  'Carpentry', 'Furniture Making', 'Roofing', 'Tiling', 'Masonry', 'Bricklaying',
  'Plastering', 'Painting', 'House Painting', 'Construction', 'Welding', 'Fabrication',
  'Cleaning', 'Deep Cleaning', 'Laundry', 'Cooking', 'Catering', 'Baking',
  'Driving', 'Dispatch Riding', 'Auto Repair', 'AC Repair', 'Refrigeration',
  'Barbing', 'Hair Styling', 'Makeup', 'Tailoring', 'Fashion Design', 'Embroidery',
  'Gardening', 'Landscaping', 'Security', 'Photography', 'Videography',
  'Teaching', 'Tutoring', 'Event Planning', 'Moving & Packing', 'IT Support',
]

/* ─── Username field ─────────────────────────────────────────────────────── */
function UsernameField({
  value, onChange, allUsers, excludeId,
}: {
  value: string
  onChange: (v: string, valid: boolean) => void
  allUsers: AppStore['allUsers']
  excludeId?: string
}) {
  const [touched, setTouched] = useState(false)
  const isValid = value.length >= 3 && /^[a-z0-9_]+$/.test(value)
  const isTaken = touched && isValid && !isUsernameAvailable(value, allUsers, excludeId)
  const isGood = touched && isValid && !isTaken

  return (
    <div>
      <label className="block text-sm font-bold text-foreground mb-1">
        Username <span className="text-destructive">*</span>
      </label>
      <p className="text-xs text-muted-foreground mb-2">
        Lowercase letters, numbers, underscores only. Min 3 characters.
      </p>
      <div className="relative">
        <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="e.g. chukwu_plumbing"
          value={value}
          maxLength={24}
          onChange={e => {
            const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
            const valid = v.length >= 3 && isUsernameAvailable(v, allUsers, excludeId)
            onChange(v, valid)
          }}
          onBlur={() => setTouched(true)}
          className={`w-full pl-8 pr-10 py-3.5 border-2 rounded-xl focus:outline-none transition text-foreground text-base
            ${!touched ? 'border-border focus:border-primary'
              : isGood ? 'border-green-500 focus:border-green-500'
                : 'border-destructive focus:border-destructive'}`}
        />
        {touched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isGood
              ? <Check size={16} className="text-green-500" />
              : <X size={16} className="text-destructive" />}
          </div>
        )}
      </div>
      {touched && isTaken && (
        <p className="text-xs text-destructive mt-1">That username is taken. Try another.</p>
      )}
      {touched && !isValid && value.length > 0 && (
        <p className="text-xs text-destructive mt-1">
          {value.length < 3 ? 'Too short — at least 3 characters.' : 'Only letters, numbers, and underscores allowed.'}
        </p>
      )}
    </div>
  )
}

/* ─── Searchable skills picker ───────────────────────────────────────────── */
function SkillsPicker({
  selected, onChange,
}: {
  selected: string[]
  onChange: (skills: string[]) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = query.length > 0
    ? ALL_SKILLS.filter(s => s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s))
    : ALL_SKILLS.filter(s => !selected.includes(s)).slice(0, 12)

  const add = (skill: string) => {
    if (selected.length >= 6) return
    onChange([...selected, skill])
    setQuery('')
    inputRef.current?.focus()
  }

  const remove = (skill: string) => onChange(selected.filter(s => s !== skill))

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addCustom = () => {
    const trimmed = query.trim()
    if (trimmed && !selected.includes(trimmed) && selected.length < 6) {
      onChange([...selected, trimmed])
      setQuery('')
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold text-foreground mb-1">
        Your Skills <span className="text-muted-foreground font-normal">(up to 6)</span>
      </label>
      <p className="text-xs text-muted-foreground mb-2">
        Type to search or browse — e.g. "plumb", "tailor", "clean"
      </p>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map(skill => (
            <motion.span
              key={skill}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold"
            >
              {skill}
              <button onClick={() => remove(skill)} className="hover:opacity-70 transition">
                <X size={13} />
              </button>
            </motion.span>
          ))}
        </div>
      )}

      {/* Search input */}
      {selected.length < 6 && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search skills..."
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Enter' && query.trim()) {
                  const exact = ALL_SKILLS.find(s => s.toLowerCase() === query.toLowerCase())
                  exact ? add(exact) : addCustom()
                }
                if (e.key === 'Escape') setOpen(false)
              }}
              className="w-full pl-9 pr-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition"
            />
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {open && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
              >
                <div className="max-h-48 overflow-y-auto">
                  {filtered.map(skill => (
                    <button
                      key={skill}
                      onMouseDown={e => { e.preventDefault(); add(skill) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition flex items-center justify-between group"
                    >
                      {skill}
                      <span className="text-xs text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition">
                        + Add
                      </span>
                    </button>
                  ))}
                  {query.trim() && !ALL_SKILLS.some(s => s.toLowerCase() === query.toLowerCase()) && (
                    <button
                      onMouseDown={e => { e.preventDefault(); addCustom() }}
                      className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-primary/10 transition border-t border-border flex items-center gap-2"
                    >
                      <span className="font-semibold">+ Add "{query.trim()}"</span>
                      <span className="text-xs text-muted-foreground">custom skill</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        {selected.length === 0 ? 'No skills added yet' : `${selected.length}/6 skills added`}
      </p>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function ProfileSetup() {
  const { setCurrentPage, setCurrentUser, setJobs, setBookings, setNotifications, setTransactions, setShops, allUsers } = useAppStore()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameValid, setUsernameValid] = useState(false)
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'basic' | 'skills'>('basic')
  const [skills, setSkills] = useState<string[]>([])

  const role = (sessionStorage.getItem('selectedRole') === 'find-work'
    ? 'worker'
    : sessionStorage.getItem('selectedRole') as UserRole) || 'worker'
  const phone = sessionStorage.getItem('userPhone') || ''
  const isWorker = role === 'worker'

  // Auto-suggest username from name
  useEffect(() => {
    if (name && !username) {
      const suggested = generateUsernameFromName(name)
      setUsername(suggested)
      setUsernameValid(suggested.length >= 3 && isUsernameAvailable(suggested, allUsers))
    }
  }, [name])

  const handleBasicSubmit = () => {
    if (!name.trim() || !usernameValid) return
    if (isWorker) setStep('skills')
    else handleComplete()
  }

  const handleComplete = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        phone,
        name: name.trim(),
        username: username.trim(),
        role,
        bio: bio.trim() || undefined,
        skills: isWorker && skills.length > 0 ? skills : undefined,
        rating: 5,
        completedJobs: 0,
      }
      setCurrentUser(newUser)
      setJobs(mockJobs)
      setBookings(mockBookings)
      setNotifications(mockNotifications)
      setTransactions(mockTransactions)
      setShops(mockShops)
      sessionStorage.removeItem('selectedRole')
      sessionStorage.removeItem('userPhone')
      setCurrentPage('dashboard')
      setIsLoading(false)
    }, 900)
  }

  const progressSteps = isWorker ? 2 : 1
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
          <button onClick={() => setCurrentPage('splash')} className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">B</span>
            </div>
            <span className="text-xl font-black text-foreground">Butsó</span>
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: progressSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Basic info ── */}
          {step === 'basic' && (
            <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                  {isWorker ? <HardHat className="text-primary" size={28} /> : <Briefcase className="text-primary" size={28} />}
                </div>
                <h1 className="text-2xl font-black text-foreground mb-1">
                  {isWorker ? 'Set Up Your Worker Profile' : 'Set Up Your Account'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isWorker ? 'Employers will see this when you apply' : 'Just your name is enough to start'}
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chukwu Okonkwo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3.5 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 transition text-base"
                />
              </div>

              {/* Username */}
              <UsernameField
                value={username}
                onChange={(v, valid) => { setUsername(v); setUsernameValid(valid) }}
                allUsers={allUsers}
              />

              {/* Bio */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">
                  Short Bio <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder={isWorker
                    ? 'e.g. Experienced plumber, 5 years in Wukari'
                    : 'e.g. Looking for reliable workers for home projects'}
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 150))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 resize-none transition text-sm"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{bio.length}/150</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleBasicSubmit}
                disabled={!name.trim() || !usernameValid}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-base"
              >
                {isWorker ? 'Next: Add Skills' : 'Create Account'}
                <ChevronRight size={20} />
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Skills (workers only) ── */}
          {step === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                  <span className="text-3xl">🛠️</span>
                </div>
                <h1 className="text-2xl font-black text-foreground mb-1">What can you do?</h1>
                <p className="text-muted-foreground text-sm">Search and pick your skills. Up to 6.</p>
              </div>

              <SkillsPicker selected={skills} onChange={setSkills} />

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up...</>
                ) : skills.length === 0 ? 'Skip for now' : 'Complete Setup'}
              </motion.button>

              <button onClick={() => setStep('basic')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition py-2">
                ← Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}