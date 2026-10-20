'use client'

import { showToast } from '@/lib/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Mail, MailCheck, Smartphone, KeyRound } from 'lucide-react'
import { useAppStore, type UserRole, goAfterAuth } from '@/lib/store'
import { loadUserData } from '@/lib/loadUserData'
import { supabase } from '@/lib/supabase'

type Panel = 'signup' | 'login'
type Method = null | 'phone' | 'email'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
        <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
)

export function AuthPage() {
    const { setCurrentPage, setCurrentUser, setDashboardMode } = useAppStore()
    // "Log in" buttons open the Log in tab; everything else opens Sign up
    const [panel, setPanel] = useState<Panel>(() => useAppStore.getState().authPanel)
    useEffect(() => { useAppStore.setState({ authPanel: 'signup' }) }, [])

    // Shared method state per panel
    const [signupMethod, setSignupMethod] = useState<Method>(null)
    const [signupPhoneStep, setSignupPhoneStep] = useState<'input' | 'otp'>('input')
    const [signupEmailStep, setSignupEmailStep] = useState<'input' | 'confirm'>('input')

    const [loginMethod, setLoginMethod] = useState<Method>(null)
    const [loginPhoneStep, setLoginPhoneStep] = useState<'input' | 'otp'>('input')

    // Field values
    const [signupPhone, setSignupPhone] = useState('')
    const [signupEmail, setSignupEmail] = useState('')
    const [loginPhone, setLoginPhone] = useState('')
    const [loginEmail, setLoginEmail] = useState('')
    const [signupPassword, setSignupPassword] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [infoMsg, setInfoMsg] = useState('')

    const [phoneError, setPhoneError] = useState('')
    const [emailError, setEmailError] = useState('')

    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [loginOtp, setLoginOtp] = useState(['', '', '', '', '', ''])
    const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null])
    const loginOtpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null])

    const [isLoading, setIsLoading] = useState(false)

    // ── OTP handlers ─────────────────────────────────────────────────────────
    const handleOtpChange = (
        index: number, value: string,
        arr: string[], setArr: (v: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete: (finalCode: string) => void
    ) => {
        const digit = value.replace(/\D/g, '').slice(-1)
        const next = [...arr]; next[index] = digit; setArr(next)
        if (digit && index < 5) {
            const targetIndex = index + 1
            requestAnimationFrame(() => {
                refs.current[targetIndex]?.focus()
            })
        }
        if (next.every(d => d !== '')) setTimeout(() => onComplete(next.join('')), 150)
    }

    const handleOtpKeyDown = (
        index: number, e: React.KeyboardEvent,
        arr: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if ((e.key === 'Backspace' || e.key === 'Delete') && !arr[index] && index > 0) {
            const targetIndex = index - 1
            requestAnimationFrame(() => {
                refs.current[targetIndex]?.focus()
            })
        }
    }

    const handleOtpPaste = (
        e: React.ClipboardEvent,
        setArr: (v: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete: (finalCode: string) => void
    ) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const next = ['', '', '', '', '', '']
        pasted.split('').forEach((c, i) => { next[i] = c })
        setArr(next)
        refs.current[Math.min(pasted.length, 5)]?.focus()
        if (pasted.length === 6) setTimeout(() => onComplete(next.join('')), 150)
    }

    // Phone OTP path is kept for later but hidden from the UI for now.
    const verifyAndProceed = async (
        contact: string,
        code: string,
        type: 'phone' | 'email'
    ) => {
        setIsLoading(true)
        const { error } = type === 'phone'
            ? await supabase.auth.verifyOtp({ phone: contact, token: code, type: 'sms' })
            : await supabase.auth.verifyOtp({ email: contact, token: code, type: 'email' })
        setIsLoading(false)
        if (error) {
            showToast('error', error.message)
            return
        }
        setCurrentPage('profile-setup')
    }

    const sendCode = async (
        value: string,
        type: 'phone' | 'email',
        onSuccess: () => void
    ) => {
        if (type === 'phone') {
            const normalized = value.replace(/^0/, '')
            if (normalized.length !== 10) { setPhoneError('Enter a valid Nigerian number'); return }
            setPhoneError('')
            setIsLoading(true)
            const { error } = await supabase.auth.signInWithOtp({ phone: `+234${normalized}` })
            setIsLoading(false)
            if (error) { setPhoneError(error.message); return }
            onSuccess()
        } else {
            if (!value.includes('@')) { setEmailError('Enter a valid email address'); return }
            setEmailError('')
            setIsLoading(true)
            const { error } = await supabase.auth.signInWithOtp({ email: value })
            setIsLoading(false)
            if (error) { setEmailError(error.message); return }
            onSuccess()
        }
    }

    // ── Email + password auth ────────────────────────────────────────────────
    const friendlyAuthError = (msg: string) =>
        msg === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : msg.toLowerCase().includes('email not confirmed')
                ? 'Please confirm your email first. Check your inbox for the link.'
                : msg

    // Returning users already have a profiles row: load it and go straight to the
    // dashboard. Brand-new users (no row yet) finish onboarding in profile-setup.
    const routeAfterLogin = async (userId: string) => {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        if (!p) { setCurrentPage('profile-setup'); return }
        setCurrentUser({
            id: p.id,
            phone: p.phone || '',
            name: p.name,
            username: p.username,
            role: p.role as UserRole,
            bio: p.bio ?? undefined,
            gender: p.gender ?? undefined,
            skills: p.skills?.length ? p.skills : undefined,
            rating: Number(p.rating ?? 5),
            completedJobs: p.completed_jobs ?? 0,
        })
        setDashboardMode(p.role === 'employer' ? 'need-help' : 'find-work')
        loadUserData(p.id)
        goAfterAuth()
    }

    const handleEmailSignup = async () => {
        const email = signupEmail.trim()
        if (!email.includes('@')) { setEmailError('Enter a valid email address'); return }
        if (signupPassword.length < 8) { setEmailError('Password must be at least 8 characters'); return }
        setEmailError(''); setInfoMsg(''); setIsLoading(true)
        const { data, error } = await supabase.auth.signUp({
            email,
            password: signupPassword,
            options: { emailRedirectTo: window.location.origin },
        })
        setIsLoading(false)
        if (error) { setEmailError(friendlyAuthError(error.message)); return }
        // For an already-registered email Supabase returns a user with no identities and no error.
        if (data.user && data.user.identities?.length === 0) {
            setEmailError('An account with this email already exists. Try logging in.')
            return
        }
        if (data.session) { setCurrentPage('profile-setup'); return } // email confirmation is off
        setSignupEmailStep('confirm') // email confirmation is on: tell them to check their inbox
    }

    const handleEmailLogin = async () => {
        const email = loginEmail.trim()
        if (!email.includes('@')) { setEmailError('Enter a valid email address'); return }
        setEmailError(''); setIsLoading(true)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: loginPassword })
        if (error || !data.user) {
            setIsLoading(false)
            setEmailError(friendlyAuthError(error?.message ?? 'Could not log in'))
            return
        }
        await routeAfterLogin(data.user.id)
        setIsLoading(false)
    }

    const resendConfirmation = async () => {
        setInfoMsg(''); setEmailError(''); setIsLoading(true)
        const { error } = await supabase.auth.resend({ type: 'signup', email: signupEmail.trim() })
        setIsLoading(false)
        if (error) setEmailError(error.message)
        else setInfoMsg('Confirmation email sent again.')
    }

    // ── Shared UI ─────────────────────────────────────────────────────────────
    const renderOtpBoxes = (
        arr: string[],
        setArr: (v: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete: (finalCode: string) => void
    ) => (
        <div className="flex gap-3 justify-center"
            onPaste={e => handleOtpPaste(e, setArr, refs, onComplete)}>
            {arr.map((digit, i) => (
                <input
                    key={i}
                    aria-label={`Verification code digit ${i + 1}`}
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    ref={el => { refs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value, arr, setArr, refs, onComplete)}
                    onKeyDown={e => handleOtpKeyDown(i, e, arr, refs)}
                    disabled={isLoading}
                    className={`w-14 h-14 border-2 rounded-xl text-center text-2xl font-black focus:outline-none focus:ring-4 focus:ring-primary/40 focus:scale-105 transition
            ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground focus:border-primary'}
            disabled:opacity-50`}
                />
            ))}
        </div>
    )

    const Divider = () => (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
        </div>
    )

    const BackBtn = ({ onClick }: { onClick: () => void }) => (
        <button onClick={onClick} className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1 mb-4">
            ← Back
        </button>
    )

    const OtpStep = ({
        contact, arr, setArr, refs, onBack, type
    }: {
        contact: string
        arr: string[]
        setArr: (v: string[]) => void
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>
        onBack: () => void
        type: 'phone' | 'email'
    }) => (
        <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25, ease }} className="space-y-5">
            <BackBtn onClick={() => { onBack(); setOtp(['', '', '', '', '', '']); setLoginOtp(['', '', '', '', '', '']) }} />
            <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                    <KeyRound size={22} className="text-primary" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Enter the code</h2>
                <p className="text-muted-foreground text-sm">Sent to <strong>{contact}</strong></p>
            </div>
            {renderOtpBoxes(arr, setArr, refs, (finalCode) => verifyAndProceed(contact, finalCode, type))}
            {isLoading && (
                <div className="flex items-center justify-center gap-2 text-primary">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm font-medium">Verifying...</span>
                </div>
            )}
            <p className="text-center text-sm text-muted-foreground">
                Didn't get it?{' '}
                <button onClick={() => { setOtp(['', '', '', '', '', '']); setLoginOtp(['', '', '', '', '', '']); setTimeout(() => refs.current[0]?.focus(), 50) }}
                    className="text-primary font-bold hover:underline">Resend</button>
            </p>
        </motion.div>
    )

    // ── Auth options screen (shared shape for signup + login) ─────────────────
    const renderAuthOptions = (isSignup: boolean) => (
        <motion.div
            key="options"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease }}
            className="space-y-3"
        >
            <div className="mb-6">
                <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">
                    {isSignup ? 'Join Butsó' : 'Welcome back'}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {isSignup ? 'Free to join. No CV needed.' : 'Good to see you again.'}
                </p>
            </div>

            {/* Google */}
            <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
                className="w-full py-3.5 flex items-center justify-center gap-3 border-2 border-border rounded-xl font-semibold text-sm text-foreground hover:bg-secondary hover:border-primary/30 transition"
            >
                <GoogleIcon />
                {isSignup ? 'Sign up' : 'Log in'} with Google
            </motion.button>

            <Divider />

            {/* Email */}
            <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => isSignup ? setSignupMethod('email') : setLoginMethod('email')}
                className="w-full py-3.5 flex items-center justify-center gap-3 border-2 border-border rounded-xl font-semibold text-sm text-foreground hover:bg-secondary hover:border-primary/30 transition"
            >
                <Mail size={18} />
                Continue with Email
            </motion.button>

            <p className="text-center text-sm text-muted-foreground pt-2">
                {isSignup ? 'Already have an account? ' : 'No account yet? '}
                <button
                    onClick={() => { setPanel(isSignup ? 'login' : 'signup'); setSignupMethod(null); setLoginMethod(null) }}
                    className="text-primary font-bold hover:underline"
                >
                    {isSignup ? 'Log in' : 'Sign up free'}
                </button>
            </p>
        </motion.div>
    )

    // ── Phone input screen ────────────────────────────────────────────────────
    const renderPhoneInput = (
        value: string,
        setValue: (v: string) => void,
        onBack: () => void,
        onNext: () => void,
        isSignup: boolean
    ) => (
        <motion.div
            key="phone-input"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease }}
            className="space-y-4"
        >
            <BackBtn onClick={onBack} />
            <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                    <Smartphone size={22} className="text-primary" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Your number</h2>
                <p className="text-muted-foreground text-sm">We'll send a 6-digit code to verify</p>
            </div>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+234</span>
                <input
                    type="tel" aria-label="Phone number" inputMode="tel" autoComplete="tel" placeholder="08012345678" value={value} autoFocus
                    onChange={e => { setValue(e.target.value.replace(/\D/g, '').slice(0, 11)); setPhoneError('') }}
                    onKeyDown={e => e.key === 'Enter' && value.replace(/^0/, '').length === 10 && onNext()}
                    className="w-full pl-16 pr-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base font-medium placeholder:text-muted-foreground/40 transition"
                />
            </div>
            {phoneError && <p className="text-destructive text-sm">{phoneError}</p>}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onNext}
                disabled={isLoading || value.replace(/^0/, '').length !== 10}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
            >
                {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending code...</>
                    : 'Send Code →'}
            </motion.button>
        </motion.div>
    )

    // ── Email + password form ─────────────────────────────────────────────────
    const renderEmailForm = (
        isSignup: boolean,
        email: string, setEmail: (v: string) => void,
        password: string, setPassword: (v: string) => void,
        onBack: () => void,
        onSubmit: () => void
    ) => (
        <motion.div
            key="email-form"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease }}
            className="space-y-4"
        >
            <BackBtn onClick={() => { setEmailError(''); setShowPassword(false); onBack() }} />
            <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                    <Mail size={22} className="text-primary" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">
                    {isSignup ? 'Create your account' : 'Log in with email'}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isSignup ? 'Use your email and choose a password' : 'Enter your email and password'}
                </p>
            </div>
            <input
                type="email" aria-label="Email address" placeholder="you@example.com" value={email} autoFocus autoComplete="email"
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                className="w-full px-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base placeholder:text-muted-foreground/40 transition"
            />
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    aria-label="Password"
                    placeholder={isSignup ? 'Password (min 8 characters)' : 'Password'}
                    value={password}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    onChange={e => { setPassword(e.target.value); setEmailError('') }}
                    onKeyDown={e => e.key === 'Enter' && onSubmit()}
                    className="w-full px-4 py-4 pr-16 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base placeholder:text-muted-foreground/40 transition"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>
            {!isSignup && (
                <div className="flex justify-end -mt-1">
                    <button
                        type="button"
                        onClick={() => setCurrentPage('forgot-password')}
                        className="text-xs font-semibold text-primary hover:underline py-2"
                    >
                        Forgot password?
                    </button>
                </div>
            )}
            {emailError && <p className="text-destructive text-sm">{emailError}</p>}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onSubmit}
                disabled={isLoading || !email.includes('@') || password.length < (isSignup ? 8 : 1)}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
            >
                {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isSignup ? 'Creating account...' : 'Logging in...'}</>
                    : (isSignup ? 'Create account' : 'Log in')}
            </motion.button>
        </motion.div>
    )

    // ── "Check your inbox" screen (only shown when email confirmation is on) ──
    const renderConfirmEmail = () => (
        <motion.div
            key="email-confirm"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease }}
            className="space-y-4"
        >
            <BackBtn onClick={() => { setSignupEmailStep('input'); setInfoMsg(''); setEmailError('') }} />
            <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                    <MailCheck size={22} className="text-primary" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Check your inbox</h2>
                <p className="text-muted-foreground text-sm">
                    We sent a confirmation link to <strong>{signupEmail.trim()}</strong>. Click it, then come back here and log in.
                </p>
            </div>
            {infoMsg && <p className="text-sm text-green-600">{infoMsg}</p>}
            {emailError && <p className="text-destructive text-sm">{emailError}</p>}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                    setLoginEmail(signupEmail.trim()); setLoginPassword('')
                    setSignupEmailStep('input'); setSignupMethod(null)
                    setPanel('login'); setLoginMethod('email')
                    setInfoMsg(''); setEmailError('')
                }}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition text-sm"
            >
                I've confirmed, log me in
            </motion.button>
            <p className="text-center text-sm text-muted-foreground">
                Didn't get it?{' '}
                <button onClick={resendConfirmation} disabled={isLoading} className="text-primary font-bold hover:underline disabled:opacity-50">
                    Resend
                </button>
            </p>
        </motion.div>
    )

    return (
        <div className="min-h-screen bg-background flex flex-col">

            {/* ── Nav ── */}
            <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
                <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto h-14">
                    <button onClick={() => setCurrentPage('splash')} className="flex items-center gap-2 hover:opacity-70 transition">
                        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-black text-xs">B</span>
                        </div>
                        <span className="text-lg font-black text-foreground tracking-tight">Butsó</span>
                    </button>

                    {/* Sliding pill toggle */}
                    <div className="relative flex items-center bg-secondary rounded-xl p-1">
                        <motion.div
                            className="absolute top-1 bottom-1 rounded-lg bg-background shadow-sm"
                            animate={{ left: panel === 'signup' ? '4px' : '50%', width: 'calc(50% - 4px)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                        {(['signup', 'login'] as Panel[]).map(p => (
                            <button
                                key={p}
                                onClick={() => { setPanel(p); setSignupMethod(null); setLoginMethod(null) }}
                                className="relative z-10 px-5 py-1.5 text-sm font-bold transition-colors duration-200"
                                style={{ color: panel === p ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                            >
                                {p === 'signup' ? 'Sign up' : 'Log in'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex-1 flex items-center justify-center px-4 py-10 overflow-hidden">
                <div className="w-full max-w-sm">
                    <AnimatePresence mode="wait">

                        {/* ══ SIGN UP ══ */}
                        {panel === 'signup' && (
                            <motion.div
                                key="signup-panel"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                            >
                                <AnimatePresence mode="wait">
                                    {signupMethod === null && renderAuthOptions(true)}

                                    {signupMethod === 'phone' && signupPhoneStep === 'input' &&
                                        renderPhoneInput(
                                            signupPhone, setSignupPhone,
                                            () => setSignupMethod(null),
                                            () => sendCode(signupPhone, 'phone', () => setSignupPhoneStep('otp')),
                                            true
                                        )
                                    }

                                    {signupMethod === 'phone' && signupPhoneStep === 'otp' && (
                                        <OtpStep
                                            contact={`+234${signupPhone.replace(/^0/, '')}`}
                                            arr={otp} setArr={setOtp} refs={otpRefs}
                                            onBack={() => setSignupPhoneStep('input')}
                                            type="phone"
                                        />
                                    )}

                                    {signupMethod === 'email' && signupEmailStep === 'input' &&
                                        renderEmailForm(
                                            true,
                                            signupEmail, setSignupEmail,
                                            signupPassword, setSignupPassword,
                                            () => setSignupMethod(null),
                                            handleEmailSignup
                                        )
                                    }

                                    {signupMethod === 'email' && signupEmailStep === 'confirm' && renderConfirmEmail()}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* ══ LOG IN ══ */}
                        {panel === 'login' && (
                            <motion.div
                                key="login-panel"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                            >
                                <AnimatePresence mode="wait">
                                    {loginMethod === null && renderAuthOptions(false)}

                                    {loginMethod === 'phone' && loginPhoneStep === 'input' &&
                                        renderPhoneInput(
                                            loginPhone, setLoginPhone,
                                            () => setLoginMethod(null),
                                            () => sendCode(loginPhone, 'phone', () => setLoginPhoneStep('otp')),
                                            false
                                        )
                                    }

                                    {loginMethod === 'phone' && loginPhoneStep === 'otp' && (
                                        <OtpStep
                                            contact={`+234${loginPhone.replace(/^0/, '')}`}
                                            arr={loginOtp} setArr={setLoginOtp} refs={loginOtpRefs}
                                            onBack={() => setLoginPhoneStep('input')}
                                            type="phone"
                                        />
                                    )}

                                    {loginMethod === 'email' &&
                                        renderEmailForm(
                                            false,
                                            loginEmail, setLoginEmail,
                                            loginPassword, setLoginPassword,
                                            () => setLoginMethod(null),
                                            handleEmailLogin
                                        )
                                    }
                                </AnimatePresence>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-4 pb-8 text-center">
                <p className="text-xs text-muted-foreground">
                    By continuing you agree to our{' '}
                    <button onClick={() => setCurrentPage('terms')} className="underline hover:text-foreground transition">Terms</button>
                    {' '}and{' '}
                    <button onClick={() => setCurrentPage('privacy')} className="underline hover:text-foreground transition">Privacy Policy</button>
                </p>
            </div>
        </div>
    )
}