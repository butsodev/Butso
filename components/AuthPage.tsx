'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'

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
    const { setCurrentPage } = useAppStore()
    const [panel, setPanel] = useState<Panel>('signup')

    // Shared method state per panel
    const [signupMethod, setSignupMethod] = useState<Method>(null)
    const [signupPhoneStep, setSignupPhoneStep] = useState<'input' | 'otp'>('input')
    const [signupEmailStep, setSignupEmailStep] = useState<'input' | 'otp'>('input')

    const [loginMethod, setLoginMethod] = useState<Method>(null)
    const [loginPhoneStep, setLoginPhoneStep] = useState<'input' | 'otp'>('input')
    const [loginEmailStep, setLoginEmailStep] = useState<'input' | 'otp'>('input')

    // Field values
    const [signupPhone, setSignupPhone] = useState('')
    const [signupEmail, setSignupEmail] = useState('')
    const [loginPhone, setLoginPhone] = useState('')
    const [loginEmail, setLoginEmail] = useState('')

    const [phoneError, setPhoneError] = useState('')
    const [emailError, setEmailError] = useState('')

    const [otp, setOtp] = useState(['', '', '', ''])
    const [loginOtp, setLoginOtp] = useState(['', '', '', ''])
    const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])
    const loginOtpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

    const [isLoading, setIsLoading] = useState(false)

    // ── OTP handlers ─────────────────────────────────────────────────────────
    const handleOtpChange = (
        index: number, value: string,
        arr: string[], setArr: (v: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete: () => void
    ) => {
        const digit = value.replace(/\D/g, '').slice(-1)
        const next = [...arr]; next[index] = digit; setArr(next)
        if (digit && index < 3) refs.current[index + 1]?.focus()
        if (next.every(d => d !== '')) setTimeout(onComplete, 150)
    }

    const handleOtpKeyDown = (
        index: number, e: React.KeyboardEvent,
        arr: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (e.key === 'Backspace' && !arr[index] && index > 0) refs.current[index - 1]?.focus()
    }

    const handleOtpPaste = (
        e: React.ClipboardEvent,
        setArr: (v: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete: () => void
    ) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
        const next = ['', '', '', '']
        pasted.split('').forEach((c, i) => { next[i] = c })
        setArr(next)
        refs.current[Math.min(pasted.length, 3)]?.focus()
        if (pasted.length === 4) setTimeout(onComplete, 150)
    }

    const verifyAndProceed = () => {
        setIsLoading(true)
        setTimeout(() => {
            setCurrentPage('profile-setup')
            setIsLoading(false)
        }, 700)
    }

    const sendCode = (
        value: string,
        type: 'phone' | 'email',
        onSuccess: () => void
    ) => {
        if (type === 'phone') {
            if (value.length < 10) { setPhoneError('Enter a valid Nigerian number'); return }
            setPhoneError('')
            sessionStorage.setItem('userPhone', value)
        } else {
            if (!value.includes('@')) { setEmailError('Enter a valid email address'); return }
            setEmailError('')
            sessionStorage.setItem('userPhone', value) // reuse key for now
        }
        setIsLoading(true)
        setTimeout(() => { setIsLoading(false); onSuccess() }, 800)
    }

    // ── Shared UI ─────────────────────────────────────────────────────────────
    const renderOtpBoxes = (
        arr: string[],
        setArr: (v: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete: () => void
    ) => (
        <div className="flex gap-3 justify-center"
            onPaste={e => handleOtpPaste(e, setArr, refs, onComplete)}>
            {arr.map((digit, i) => (
                <input
                    key={i}
                    ref={el => { refs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value, arr, setArr, refs, onComplete)}
                    onKeyDown={e => handleOtpKeyDown(i, e, arr, refs)}
                    disabled={isLoading}
                    className={`w-14 h-14 border-2 rounded-xl text-center text-2xl font-black focus:outline-none transition
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
        contact, arr, setArr, refs, onBack
    }: {
        contact: string
        arr: string[]
        setArr: (v: string[]) => void
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>
        onBack: () => void
    }) => (
        <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25, ease }} className="space-y-5">
            <BackBtn onClick={() => { onBack(); setOtp(['', '', '', '']); setLoginOtp(['', '', '', '']) }} />
            <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                    <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Enter the code</h2>
                <p className="text-muted-foreground text-sm">Sent to <strong>{contact}</strong></p>
            </div>
            {renderOtpBoxes(arr, setArr, refs, verifyAndProceed)}
            {isLoading && (
                <div className="flex items-center justify-center gap-2 text-primary">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm font-medium">Verifying...</span>
                </div>
            )}
            <p className="text-center text-sm text-muted-foreground">
                Didn't get it?{' '}
                <button onClick={() => { setOtp(['', '', '', '']); setLoginOtp(['', '', '', '']); setTimeout(() => refs.current[0]?.focus(), 50) }}
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
                onClick={() => alert('Google sign-in coming soon!')}
                className="w-full py-3.5 flex items-center justify-center gap-3 border-2 border-border rounded-xl font-semibold text-sm text-foreground hover:bg-secondary hover:border-primary/30 transition"
            >
                <GoogleIcon />
                {isSignup ? 'Sign up' : 'Log in'} with Google
            </motion.button>

            <Divider />

            {/* Phone */}
            <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => isSignup ? setSignupMethod('phone') : setLoginMethod('phone')}
                className="w-full py-3.5 flex items-center justify-center gap-3 border-2 border-border rounded-xl font-semibold text-sm text-foreground hover:bg-secondary hover:border-primary/30 transition"
            >
                <span className="text-lg">📱</span>
                Continue with Phone Number
            </motion.button>

            {/* Email */}
            <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => isSignup ? setSignupMethod('email') : setLoginMethod('email')}
                className="w-full py-3.5 flex items-center justify-center gap-3 border-2 border-border rounded-xl font-semibold text-sm text-foreground hover:bg-secondary hover:border-primary/30 transition"
            >
                <span className="text-lg">✉️</span>
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
                    <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Your number</h2>
                <p className="text-muted-foreground text-sm">We'll send a 4-digit code to verify</p>
            </div>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+234</span>
                <input
                    type="tel" placeholder="08012345678" value={value} autoFocus
                    onChange={e => { setValue(e.target.value.replace(/\D/g, '').slice(0, 11)); setPhoneError('') }}
                    onKeyDown={e => e.key === 'Enter' && value.length >= 10 && onNext()}
                    className="w-full pl-16 pr-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base font-medium placeholder:text-muted-foreground/40 transition"
                />
            </div>
            {phoneError && <p className="text-destructive text-sm">{phoneError}</p>}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onNext}
                disabled={isLoading || value.length < 10}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
            >
                {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending code...</>
                    : 'Send Code →'}
            </motion.button>
        </motion.div>
    )

    // ── Email input screen ────────────────────────────────────────────────────
    const renderEmailInput = (
        value: string,
        setValue: (v: string) => void,
        onBack: () => void,
        onNext: () => void
    ) => (
        <motion.div
            key="email-input"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease }}
            className="space-y-4"
        >
            <BackBtn onClick={onBack} />
            <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                    <span className="text-2xl">✉️</span>
                </div>
                <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Your email</h2>
                <p className="text-muted-foreground text-sm">We'll send a verification code</p>
            </div>
            <input
                type="email" placeholder="you@example.com" value={value} autoFocus
                onChange={e => { setValue(e.target.value); setEmailError('') }}
                onKeyDown={e => e.key === 'Enter' && onNext()}
                className="w-full px-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base placeholder:text-muted-foreground/40 transition"
            />
            {emailError && <p className="text-destructive text-sm">{emailError}</p>}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onNext}
                disabled={isLoading || !value.includes('@')}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
            >
                {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending code...</>
                    : 'Send Code →'}
            </motion.button>
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
                                            contact={`+234 ${signupPhone}`}
                                            arr={otp} setArr={setOtp} refs={otpRefs}
                                            onBack={() => setSignupPhoneStep('input')}
                                        />
                                    )}

                                    {signupMethod === 'email' && signupEmailStep === 'input' &&
                                        renderEmailInput(
                                            signupEmail, setSignupEmail,
                                            () => setSignupMethod(null),
                                            () => sendCode(signupEmail, 'email', () => setSignupEmailStep('otp'))
                                        )
                                    }

                                    {signupMethod === 'email' && signupEmailStep === 'otp' && (
                                        <OtpStep
                                            contact={signupEmail}
                                            arr={otp} setArr={setOtp} refs={otpRefs}
                                            onBack={() => setSignupEmailStep('input')}
                                        />
                                    )}
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
                                            contact={`+234 ${loginPhone}`}
                                            arr={loginOtp} setArr={setLoginOtp} refs={loginOtpRefs}
                                            onBack={() => setLoginPhoneStep('input')}
                                        />
                                    )}

                                    {loginMethod === 'email' && loginEmailStep === 'input' &&
                                        renderEmailInput(
                                            loginEmail, setLoginEmail,
                                            () => setLoginMethod(null),
                                            () => sendCode(loginEmail, 'email', () => setLoginEmailStep('otp'))
                                        )
                                    }

                                    {loginMethod === 'email' && loginEmailStep === 'otp' && (
                                        <OtpStep
                                            contact={loginEmail}
                                            arr={loginOtp} setArr={setLoginOtp} refs={loginOtpRefs}
                                            onBack={() => setLoginEmailStep('input')}
                                        />
                                    )}
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