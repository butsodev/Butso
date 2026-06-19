'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Briefcase, HardHat, Search, X, Check, AtSign } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppStore, generateUsernameFromName, isUsernameAvailable, type UserRole, type AppStore } from '@/lib/store'
import { mockJobs, mockBookings, mockNotifications, mockTransactions, mockShops } from '@/lib/mockData'

/* ─── Skills list ────────────────────────────────────────────────────────── */
export const ALL_SKILLS = [
  'Plumbing', 'Pipe Fitting', 'Electrical', 'Solar Installation', 'Generator Repair',
  'Carpentry', 'Furniture Making', 'Roofing', 'Tiling', 'Masonry', 'Bricklaying',
  'Plastering', 'Painting', 'House Painting', 'Construction', 'Welding', 'Fabrication',
  'Cleaning', 'Deep Cleaning', 'Laundry', 'Cooking', 'Catering', 'Baking',
  'Driving', 'Dispatch Riding', 'Auto Repair', 'AC Repair', 'Refrigeration',
  'Barbing', 'Hair Styling', 'Male Hair Braiding', 'Female Hair Styling', 'Makeup',
  'Tailoring', 'Fashion Design', 'Embroidery',
  'Gardening', 'Landscaping', 'Security', 'Photography', 'Videography',
  'Teaching', 'Tutoring', 'Event Planning', 'Moving & Packing', 'IT Support',
]

/* ─── Gender options ─────────────────────────────────────────────────────── */
type Gender = 'male' | 'female' | 'other'
const GENDER_OPTIONS: { value: Gender; emoji: string; label: string }[] = [
  { value: 'male', emoji: '👨', label: 'Male' },
  { value: 'female', emoji: '👩', label: 'Female' },
  { value: 'other', emoji: '🧑', label: 'Other / Prefer not to say' },
]

/* ─── "What now?" options ────────────────────────────────────────────────── */
const NEXT_OPTIONS = [
  {
    id: 'find-work',
    emoji: '🔍',
    title: 'Find a job',
    body: 'Browse jobs near you and apply with one tap.',
    color: 'bg-primary',
    page: 'jobs',
    mode: 'find-work' as const,
  },
  {
    id: 'post-job',
    emoji: '📋',
    title: 'Post a job',
    body: 'Need someone? Post a job and get applications fast.',
    color: 'bg-emerald-600',
    page: 'post-job',
    mode: 'need-help' as const,
  },
  {
    id: 'find-people',
    emoji: '👥',
    title: 'Find a worker',
    body: 'Browse workers by skill and hire directly.',
    color: 'bg-violet-600',
    page: 'people',
    mode: 'need-help' as const,
  },
]

/* ─── Username field ─────────────────────────────────────────────────────── */
function UsernameField({ value, onChange, allUsers, excludeId }: {
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
          placeholder="e.g. wunuken_pipes"
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
      {touched && isTaken && <p className="text-xs text-destructive mt-1">That username is taken. Try another.</p>}
      {touched && !isValid && value.length > 0 && (
        <p className="text-xs text-destructive mt-1">
          {value.length < 3 ? 'Too short — at least 3 characters.' : 'Only letters, numbers, and underscores allowed.'}
        </p>
      )}
    </div>
  )
}

/* ─── Skills picker ──────────────────────────────────────────────────────── */
function SkillsPicker({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
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
  const addCustom = () => {
    const t = query.trim()
    if (t && !selected.includes(t) && selected.length < 6) { onChange([...selected, t]); setQuery('') }
  }

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div>
      <label className="block text-sm font-bold text-foreground mb-1">
        Your Skills <span className="text-muted-foreground font-normal">(up to 6)</span>
      </label>
      <p className="text-xs text-muted-foreground mb-2">Type to search — e.g. "plumb", "tailor", "clean"</p>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map(skill => (
            <motion.span key={skill} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
              {skill}
              <button onClick={() => remove(skill)} className="hover:opacity-70 transition"><X size={13} /></button>
            </motion.span>
          ))}
        </div>
      )}

      {selected.length < 6 && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input ref={inputRef} type="text" placeholder="Search skills..."
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
          <AnimatePresence>
            {open && filtered.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {filtered.map(skill => (
                    <button key={skill} onMouseDown={e => { e.preventDefault(); add(skill) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition flex items-center justify-between group">
                      {skill}
                      <span className="text-xs text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition">+ Add</span>
                    </button>
                  ))}
                  {query.trim() && !ALL_SKILLS.some(s => s.toLowerCase() === query.toLowerCase()) && (
                    <button onMouseDown={e => { e.preventDefault(); addCustom() }}
                      className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-primary/10 transition border-t border-border flex items-center gap-2">
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

/* ─── Main ───────────────────────────────────────────────────────────────── */
type Step = 'basic' | 'gender' | 'skills' | 'next'

export function ProfileSetup() {
  const {
    setCurrentPage, setCurrentUser, setJobs, setBookings,
    setNotifications, setTransactions, setShops, allUsers, setDashboardMode,
  } = useAppStore()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameValid, setUsernameValid] = useState(false)
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<Step>('basic')
  const [pressedNext, setPressedNext] = useState<string | null>(null)

  // Robust role reading — handles both 'find-work' (from LandingPage) and legacy values
  const rawRole = sessionStorage.getItem('selectedRole') ?? ''
  const role = (rawRole === 'find-work' || rawRole === 'worker')
    ? ('worker' as UserRole)
    : ('employer' as UserRole)
  const phone = sessionStorage.getItem('userPhone') || ''
  const isWorker = role === 'worker'

  // Steps: basic → gender → skills (workers) → next
  const allSteps: Step[] = isWorker
    ? ['basic', 'gender', 'skills', 'next']
    : ['basic', 'gender', 'next']
  const stepIndex = allSteps.indexOf(step)

  useEffect(() => {
    if (name && !username) {
      const s = generateUsernameFromName(name)
      setUsername(s)
      setUsernameValid(s.length >= 3 && isUsernameAvailable(s, allUsers))
    }
  }, [name])

  const createUser = () => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      phone,
      name: name.trim(),
      username: username.trim(),
      role,
      bio: bio.trim() || undefined,
      gender: gender ?? undefined,
      skills: isWorker && skills.length > 0 ? skills : undefined,
      rating: 5,
      completedJobs: 0,
    }
  }

  const seedData = () => {
    setJobs(mockJobs)
    setBookings(mockBookings)
    setNotifications(mockNotifications)
    setTransactions(mockTransactions)
    setShops(mockShops)
    sessionStorage.removeItem('selectedRole')
    sessionStorage.removeItem('userPhone')
  }

  const handleNext = (option: typeof NEXT_OPTIONS[0]) => {
    setPressedNext(option.id)
    setIsLoading(true)
    setTimeout(() => {
      const newUser = createUser()
      setCurrentUser(newUser)
      setDashboardMode(option.mode)
      seedData()
      setCurrentPage(option.page)
      setIsLoading(false)
    }, 600)
  }

  // ── Step renderers ───────────────────────────────────────────────────────

  const StepBasic = (
    <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
          {isWorker ? <HardHat className="text-primary" size={28} /> : <Briefcase className="text-primary" size={28} />}
        </div>
        <h1 className="text-2xl font-black text-foreground mb-1">
          {isWorker ? 'Create your worker profile' : 'Create your account'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isWorker ? 'This is what hirers will see' : 'Just your name to get started'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground mb-2">
          Full Name <span className="text-destructive">*</span>
        </label>
        <input type="text" placeholder="e.g. Wunuken Danladi" value={name}
          onChange={e => setName(e.target.value)} autoFocus
          className="w-full px-4 py-3.5 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 transition text-base"
        />
      </div>

      <UsernameField value={username}
        onChange={(v, valid) => { setUsername(v); setUsernameValid(valid) }}
        allUsers={allUsers}
      />

      <div>
        <label className="block text-sm font-bold text-foreground mb-1">
          Short Bio <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          placeholder={isWorker ? 'e.g. Experienced plumber, 5 years in Wukari' : 'e.g. Looking for reliable workers for home projects'}
          value={bio} onChange={e => setBio(e.target.value.slice(0, 150))} rows={3}
          className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 resize-none transition text-sm"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{bio.length}/150</p>
      </div>

      <motion.button whileTap={{ scale: 0.98 }}
        onClick={() => setStep('gender')}
        disabled={!name.trim() || !usernameValid}
        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-base">
        Next <ChevronRight size={20} />
      </motion.button>
    </motion.div>
  )

  const StepGender = (
    <motion.div key="gender" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
          <span className="text-3xl">🧑</span>
        </div>
        <h1 className="text-2xl font-black text-foreground mb-1">Quick question</h1>
        <p className="text-muted-foreground text-sm">
          Helps personalise hair & beauty services for you.<br />
          <span className="text-xs">Note: everyone can book any service — this is just for recommendations.</span>
        </p>
      </div>

      <div className="space-y-3">
        {GENDER_OPTIONS.map(opt => (
          <motion.button key={opt.value} whileTap={{ scale: 0.97 }}
            onClick={() => setGender(opt.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${gender === opt.value
              ? 'border-primary bg-primary/8'
              : 'border-border hover:border-primary/40'
              }`}>
            <span className="text-3xl">{opt.emoji}</span>
            <span className="font-bold text-foreground">{opt.label}</span>
            {gender === opt.value && (
              <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check size={12} className="text-white" />
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.98 }}
        onClick={() => setStep(isWorker ? 'skills' : 'next')}
        disabled={!gender}
        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-base">
        Next <ChevronRight size={20} />
      </motion.button>

      <button onClick={() => setStep(isWorker ? 'skills' : 'next')}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition py-1">
        Skip this question
      </button>

      <button onClick={() => setStep('basic')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition py-1">
        ← Back
      </button>
    </motion.div>
  )

  const StepSkills = (
    <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
          <span className="text-3xl">🛠️</span>
        </div>
        <h1 className="text-2xl font-black text-foreground mb-1">What can you do?</h1>
        <p className="text-muted-foreground text-sm">Add up to 6 skills. Hirers search by these.</p>
      </div>

      <SkillsPicker selected={skills} onChange={setSkills} />

      <motion.button whileTap={{ scale: 0.98 }}
        onClick={() => setStep('next')}
        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2 text-base">
        {skills.length === 0 ? 'Skip for now' : 'Next'} <ChevronRight size={20} />
      </motion.button>

      <button onClick={() => setStep('gender')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition py-1">
        ← Back
      </button>
    </motion.div>
  )

  const StepNext = (
    <motion.div key="next" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🎉</div>
        <h1 className="text-2xl font-black text-foreground mb-1">
          You're in, {name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground text-sm">What do you want to do first?</p>
      </div>

      <div className="space-y-3">
        {NEXT_OPTIONS.map(opt => (
          <motion.button
            key={opt.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNext(opt)}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl text-left text-white transition-all shadow-md relative overflow-hidden ${opt.color} ${pressedNext === opt.id ? 'opacity-80' : ''
              }`}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <div className="flex-1">
              <p className="font-black text-base">{opt.title}</p>
              <p className="text-white/70 text-sm">{opt.body}</p>
            </div>
            {pressedNext === opt.id
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              : <ChevronRight size={20} className="text-white/70 shrink-0" />
            }
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => {
          const newUser = createUser()
          setCurrentUser(newUser)
          setDashboardMode('find-work')
          seedData()
          setCurrentPage('dashboard')
        }}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition py-2"
      >
        Just take me to my dashboard
      </button>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
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

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {allSteps.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= stepIndex ? 'bg-primary' : 'bg-border'
              }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'basic' && StepBasic}
          {step === 'gender' && StepGender}
          {step === 'skills' && StepSkills}
          {step === 'next' && StepNext}
        </AnimatePresence>

      </div>
    </motion.div>
  )
}