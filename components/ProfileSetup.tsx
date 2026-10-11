'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Briefcase, HardHat, Search, X, Check, AtSign, Shuffle,
  Wrench, ClipboardList, Users, UserRound, CheckCircle2, type LucideIcon,
} from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useAppStore, generateUsernameFromName, isUsernameAvailable, type UserRole, type AppStore } from '@/lib/store'
import { mockJobs, mockBookings, mockNotifications, mockTransactions, mockShops } from '@/lib/mockData'
import { supabase } from '@/lib/supabase'

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
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other / Prefer not to say' },
]

/* ─── "What now?" options ────────────────────────────────────────────────── */
const NEXT_OPTIONS: {
  id: string; icon: LucideIcon; title: string; body: string; color: string; page: string; mode: 'find-work' | 'need-help'
}[] = [
    {
      id: 'find-work',
      icon: Search,
      title: 'Find a job',
      body: 'Browse jobs near you and apply with one tap.',
      color: 'bg-primary',
      page: 'jobs',
      mode: 'find-work' as const,
    },
    {
      id: 'post-job',
      icon: ClipboardList,
      title: 'Post a job',
      body: 'Need someone? Post a job and get applications fast.',
      color: 'bg-emerald-600',
      page: 'post-job',
      mode: 'need-help' as const,
    },
    {
      id: 'find-people',
      icon: Users,
      title: 'Find a worker',
      body: 'Browse workers by skill and hire directly.',
      color: 'bg-violet-600',
      page: 'people',
      mode: 'need-help' as const,
    },
  ]

/* ─── Username helpers ───────────────────────────────────────────────────── */
function randomUsername(name: string): string {
  const base = generateUsernameFromName(name).slice(0, 14) || 'user'
  const n = Math.floor(100 + Math.random() * 900)
  const styles = [
    `${base}${n}`,
    `${base}_${n}`,
    `${base}_${Math.floor(10 + Math.random() * 90)}`,
    `the_${base}`,
    `${base}_ng`,
  ]
  return styles[Math.floor(Math.random() * styles.length)].slice(0, 24)
}

type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken'

/* ─── Username field ─────────────────────────────────────────────────────── */
function UsernameField({ value, name, autoMode, onChange, onValidChange, allUsers, excludeId }: {
  value: string
  name: string
  autoMode: boolean // true while the username is still auto-generated (user has not typed their own)
  onChange: (v: string, fromUser: boolean) => void
  onValidChange: (valid: boolean) => void
  allUsers: AppStore['allUsers']
  excludeId?: string
}) {
  const [status, setStatus] = useState<UsernameStatus>('idle')
  const autoRetries = useRef(0)
  const formatOk = value.length >= 3 && /^[a-z0-9_]+$/.test(value)

  // Real-time availability check (debounced), against the real profiles table
  useEffect(() => {
    if (!value) { setStatus('idle'); onValidChange(false); return }
    if (!formatOk) { setStatus('invalid'); onValidChange(false); return }
    setStatus('checking'); onValidChange(false)
    let cancelled = false
    const t = setTimeout(async () => {
      let taken = !isUsernameAvailable(value, allUsers, excludeId)
      if (!taken) {
        const { data, error } = await supabase.from('profiles').select('id').eq('username', value).maybeSingle()
        // If the lookup itself fails we let it through; the insert still enforces uniqueness
        if (!error && data && data.id !== excludeId) taken = true
      }
      if (cancelled) return
      setStatus(taken ? 'taken' : 'available')
      onValidChange(!taken)
      // Auto-generated name collided: quietly pick another instead of bothering the user
      if (taken && autoMode && autoRetries.current < 5) {
        autoRetries.current += 1
        onChange(randomUsername(name), false)
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // A few clickable alternatives when the chosen name is taken
  const suggestions = useMemo(
    () => (status === 'taken' ? [randomUsername(name), randomUsername(name), randomUsername(name)] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, value]
  )

  const borderClass =
    status === 'available' ? 'border-green-500 focus:border-green-500'
      : status === 'taken' || status === 'invalid' ? 'border-destructive focus:border-destructive'
        : 'border-border focus:border-primary'

  return (
    <div>
      <label className="block text-sm font-bold text-foreground mb-1">
        Username <span className="text-destructive">*</span>
      </label>
      <p className="text-xs text-muted-foreground mb-2">
        This is how people find you on Butsó. We made one from your name. Edit it or tap Shuffle.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="e.g. wunuken_pipes"
            value={value}
            maxLength={24}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={e => {
              autoRetries.current = 0
              onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''), true)
            }}
            className={`w-full pl-8 pr-10 py-3.5 border-2 rounded-xl focus:outline-none transition text-foreground text-base ${borderClass}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === 'checking' && (
              <span className="block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
            {status === 'available' && <Check size={16} className="text-green-500" />}
            {(status === 'taken' || status === 'invalid') && <X size={16} className="text-destructive" />}
          </div>
        </div>
        <button
          type="button"
          onClick={() => { autoRetries.current = 0; onChange(randomUsername(name), false) }}
          className="px-3.5 border-2 border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary transition flex items-center gap-1.5 text-sm font-semibold"
          aria-label="Shuffle username"
        >
          <Shuffle size={16} /> <span className="hidden sm:inline">Shuffle</span>
        </button>
      </div>

      <div className="mt-1.5 min-h-[1.25rem] text-xs">
        {status === 'idle' && <p className="text-muted-foreground">Type your name above, or pick your own. Letters, numbers and _ only.</p>}
        {status === 'invalid' && <p className="text-destructive">Use at least 3 characters (letters, numbers or _).</p>}
        {status === 'checking' && <p className="text-muted-foreground">Checking if @{value} is free...</p>}
        {status === 'available' && <p className="text-green-600">@{value} is available.</p>}
        {status === 'taken' && !autoMode && (
          <div>
            <p className="text-destructive">@{value} is already taken. Try one of these:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestions.map(sug => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => { autoRetries.current = 0; onChange(sug, false) }}
                  className="px-3 py-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition font-medium"
                >
                  @{sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
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
      <p className="text-xs text-muted-foreground mb-2">Type to search, e.g. "plumb", "tailor", "clean"</p>

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
type Step = 'role' | 'basic' | 'gender' | 'skills' | 'next'

export function ProfileSetup() {
  const {
    setCurrentPage, setCurrentUser, setJobs, setBookings,
    setNotifications, setTransactions, setShops, allUsers, setDashboardMode,
  } = useAppStore()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameValid, setUsernameValid] = useState(false)
  const [usernameEdited, setUsernameEdited] = useState(false)
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pressedNext, setPressedNext] = useState<string | null>(null)

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    () => (sessionStorage.getItem('selectedRole') as UserRole | null)
  )
  // The real, authenticated Supabase user, fetched on mount. Phone-only
  // sign-ins already have `phone` set here. Email and Google sign-ins arrive
  // without one, so phone is optional and can be typed in below.
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [authPhone, setAuthPhone] = useState<string | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthUserId(data.user.id)
        setAuthPhone(data.user.phone ? `+${data.user.phone.replace(/^\+/, '')}` : null)
      }
    })
  }, [])

  const phoneDigits = phoneInput.replace(/^0/, '')
  const phone = authPhone ?? (phoneDigits ? `+234${phoneDigits}` : '')
  const needsPhoneInput = !authPhone
  // Optional: empty is fine, but if something is typed it must be a full number
  const phoneOk = !needsPhoneInput || phoneInput === '' || phoneDigits.length === 10
  const role: UserRole = selectedRole ?? 'worker'
  const isWorker = role === 'worker'

  // Skip role step if already chosen on landing page
  const roleAlreadyChosen = !!sessionStorage.getItem('selectedRole')

  // Steps: role (skipped if already chosen) → basic → gender → skills (workers) → next
  const allSteps: Step[] = roleAlreadyChosen
    ? isWorker
      ? ['basic', 'gender', 'skills', 'next']
      : ['basic', 'gender', 'next']
    : selectedRole === null
      ? ['role']
      : isWorker
        ? ['role', 'basic', 'gender', 'skills', 'next']
        : ['role', 'basic', 'gender', 'next']

  // Start on first step (skips role if already chosen)
  const [step, setStep] = useState<Step>(allSteps[0])
  const stepIndex = allSteps.indexOf(step)

  // Keep the username in sync with the name until the user types their own
  useEffect(() => {
    if (usernameEdited) return
    const base = generateUsernameFromName(name)
    setUsername(name.trim() ? (base.length >= 3 ? base : randomUsername(name)) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  const createUser = async () => {
    if (!authUserId) {
      setSubmitError('You appear to be signed out. Please log in again.')
      return null
    }
    const profileData = {
      id: authUserId,
      phone: phone || null,
      name: name.trim(),
      username: username.trim(),
      role,
      bio: bio.trim() || null,
      gender: gender ?? null,
      skills: isWorker && skills.length > 0 ? skills : [],
    }
    const { data, error } = await supabase.from('profiles').insert(profileData).select().single()
    if (error) {
      // 23505 = unique constraint violation (username or phone already taken)
      if (error.code === '23505') {
        setSubmitError(
          error.message.includes('username')
            ? 'That username was just taken. Please pick another.'
            : 'That phone number is already registered to another account.'
        )
      } else {
        setSubmitError(error.message)
      }
      return null
    }
    return {
      id: data.id,
      phone: data.phone ?? undefined,
      name: data.name,
      username: data.username,
      role: data.role,
      bio: data.bio ?? undefined,
      gender: data.gender ?? undefined,
      skills: data.skills?.length ? data.skills : undefined,
      rating: data.rating ?? 5,
      completedJobs: data.completed_jobs ?? 0,
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

  const handleNext = async (option: typeof NEXT_OPTIONS[0]) => {
    setPressedNext(option.id)
    setIsLoading(true)
    setSubmitError('')
    const newUser = await createUser()
    setIsLoading(false)
    setPressedNext(null)
    if (!newUser) return // submitError is already set; stay on this screen
    setCurrentUser(newUser)
    setDashboardMode(option.mode)
    seedData()
    setCurrentPage(option.page)
  }

  // ── Step renderers ───────────────────────────────────────────────────────

  const StepRole = (
    <motion.div key="role" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">What are you here for?</h1>
        <p className="text-muted-foreground text-sm">Pick one. You can always do both later</p>
      </div>
      {([
        { role: 'worker' as UserRole, icon: Wrench, title: 'I have a skill to offer', sub: 'Plumbing, cleaning, electrical, carpentry and more' },
        { role: 'employer' as UserRole, icon: Briefcase, title: 'I need to hire someone', sub: 'Post a job and find reliable help fast' },
      ] as { role: UserRole; icon: LucideIcon; title: string; sub: string }[]).map(opt => (
        <motion.button
          key={opt.role}
          whileHover={{ scale: 1.015, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedRole(opt.role)
            sessionStorage.setItem('selectedRole', opt.role)
            setStep('basic')
          }}
          className="w-full p-4 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition-all group"
        >
          <div className="flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <opt.icon size={22} strokeWidth={2} />
            </span>
            <div className="flex-1">
              <p className="font-black text-foreground text-sm">{opt.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition" />
          </div>
        </motion.button>
      ))}
    </motion.div>
  )

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

      {needsPhoneInput && (
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Helps employers and workers reach you directly. You can add it later.
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+234</span>
            <input
              type="tel" placeholder="08012345678" value={phoneInput}
              onChange={e => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="w-full pl-16 pr-4 py-3.5 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base placeholder:text-muted-foreground/40 transition"
            />
          </div>
          {phoneInput !== '' && !phoneOk && (
            <p className="text-xs text-destructive mt-1">Enter a full 11-digit number, or clear it to skip.</p>
          )}
        </div>
      )}

      <UsernameField value={username} name={name} autoMode={!usernameEdited}
        onChange={(v, fromUser) => { setUsername(v); if (fromUser) setUsernameEdited(true) }}
        onValidChange={setUsernameValid}
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
        disabled={!name.trim() || !usernameValid || !phoneOk}
        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-base">
        Next <ChevronRight size={20} />
      </motion.button>
    </motion.div>
  )

  const StepGender = (
    <motion.div key="gender" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
          <UserRound className="text-primary" size={28} />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-1">Quick question</h1>
        <p className="text-muted-foreground text-sm">
          Helps personalise hair & beauty services for you.<br />
          <span className="text-xs">Note: everyone can book any service. This is just for recommendations.</span>
        </p>
      </div>

      <div className="space-y-3">
        {GENDER_OPTIONS.map(opt => (
          <motion.button key={opt.value} whileTap={{ scale: 0.97 }}
            onClick={() => setGender(opt.value)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border-2 text-left transition-all ${gender === opt.value
              ? 'border-primary bg-primary/8'
              : 'border-border hover:border-primary/40'
              }`}>
            <span className="font-semibold text-foreground">{opt.label}</span>
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
          <Wrench className="text-primary" size={28} />
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
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
          <CheckCircle2 className="text-primary" size={30} />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-1">
          You're in, {name.split(' ')[0]}
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
            <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <opt.icon size={22} strokeWidth={2} />
            </span>
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
        onClick={async () => {
          setSubmitError('')
          const newUser = await createUser()
          if (!newUser) return
          setCurrentUser(newUser)
          setDashboardMode('find-work')
          seedData()
          setCurrentPage('dashboard')
        }}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition py-2"
      >
        Just take me to my dashboard
      </button>
      {submitError && (
        <p className="text-center text-sm text-destructive">{submitError}</p>
      )}
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
          {step === 'role' && StepRole}
          {step === 'basic' && StepBasic}
          {step === 'gender' && StepGender}
          {step === 'skills' && StepSkills}
          {step === 'next' && StepNext}
        </AnimatePresence>

      </div>
    </motion.div>
  )
}