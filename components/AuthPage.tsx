'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'

type Panel = 'signup' | 'login'
type SignupStep = 'role' | 'phone' | 'otp'

export function AuthPage() {
    const { setCurrentPage } = useAppStore()
    const [panel, setPanel] = useState<Panel>('signup')

    // Signup state
    const [signupStep, setSignupStep] = useState<SignupStep>('role')
    const [selectedRole, setSelectedRole] = useState<'worker' | 'employer' | null>(null)
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState(['', '', '', ''])
    const [phoneError, setPhoneError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

    // Login state
    const [loginPhone, setLoginPhone] = useState('')
    const [loginOtp, setLoginOtp] = useState(['', '', '', ''])
    const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone')
    const [loginError, setLoginError] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)
    const loginOtpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

    // ── OTP helpers ──────────────────────────────────────────────────────────
    const handleOtpChange = (
        index: number, value: string,
        otpArr: string[], setOtpArr: (v: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete: (digits: string[]) => void
    ) => {
        const digit = value.replace(/\D/g, '').slice(-1)
        const next = [...otpArr]
        next[index] = digit
        setOtpArr(next)
        if (digit && index < 3) refs.current[index + 1]?.focus()
        if (next.every(d => d !== '')) setTimeout(() => onComplete(next), 150)
    }

    const handleOtpKeyDown = (
        index: number, e: React.KeyboardEvent,
        otpArr: string[],
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (e.key === 'Backspace' && !otpArr[index] && index > 0) refs.current[index - 1]?.focus()
    }

    const handleOtpPaste = (
        e: React.ClipboardEvent,
        setOtpArr: (v: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete: (digits: string[]) => void
    ) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
        const next = ['', '', '', '']
        pasted.split('').forEach((c, i) => { next[i] = c })
        setOtpArr(next)
        refs.current[Math.min(pasted.length, 3)]?.focus()
        if (pasted.length === 4) setTimeout(() => onComplete(next), 150)
    }

    // ── Signup flow ──────────────────────────────────────────────────────────
    const handleRoleSelect = (role: 'worker' | 'employer') => {
        setSelectedRole(role)
        sessionStorage.setItem('selectedRole', role)
        setSignupStep('phone')
    }

    const handlePhoneSubmit = () => {
        if (phone.length < 10) { setPhoneError('Enter a valid Nigerian number'); return }
        setPhoneError('')
        setIsLoading(true)
        setTimeout(() => {
            sessionStorage.setItem('userPhone', phone)
            setSignupStep('otp')
            setIsLoading(false)
            setTimeout(() => otpRefs.current[0]?.focus(), 100)
        }, 800)
    }

    const handleOtpVerify = (_digits: string[]) => {
        setIsLoading(true)
        setTimeout(() => {
            setCurrentPage('profile-setup')
            setIsLoading(false)
        }, 700)
    }

    // ── Login flow ───────────────────────────────────────────────────────────
    const handleLoginPhone = () => {
        if (loginPhone.length < 10) { setLoginError('Enter a valid number'); return }
        setLoginError('')
        setLoginLoading(true)
        setTimeout(() => {
            sessionStorage.setItem('userPhone', loginPhone)
            setLoginStep('otp')
            setLoginLoading(false)
            setTimeout(() => loginOtpRefs.current[0]?.focus(), 100)
        }, 800)
    }

    const handleLoginVerify = (_digits: string[]) => {
        setLoginLoading(true)
        setTimeout(() => {
            // For demo: login goes to profile-setup same as signup
            // In production this would look up existing account
            setCurrentPage('profile-setup')
            setLoginLoading(false)
        }, 700)
    }

    // ── Shared UI pieces ─────────────────────────────────────────────────────
    // NOTE: renderOtpBoxes is a function, NOT a component — avoids remount on each render
    const renderOtpBoxes = (
        value: string[],
        onChange: (i: number, v: string) => void,
        onKeyDown: (i: number, e: React.KeyboardEvent) => void,
        onPaste: (e: React.ClipboardEvent) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        loading: boolean
    ) => (
        <div className="flex gap-3 justify-center" onPaste={onPaste}>
            {value.map((digit, i) => (
                <input
                    key={i}
                    ref={el => { refs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => onChange(i, e.target.value)}
                    onKeyDown={e => onKeyDown(i, e)}
                    disabled={loading}
                    className={`w-14 h-14 border-2 rounded-xl text-center text-2xl font-black focus:outline-none transition
            ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground focus:border-primary'}
            disabled:opacity-50`}
                />
            ))}
        </div>
    )

    const phoneInput = (
        value: string,
        onChange: (v: string) => void,
        error: string,
        onSubmit: () => void,
        loading: boolean
    ) => (
        <div className="space-y-3">
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+234</span>
                <input
                    type="tel"
                    placeholder="08012345678"
                    value={value}
                    autoFocus
                    onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    onKeyDown={e => e.key === 'Enter' && value.length >= 10 && onSubmit()}
                    className="w-full pl-16 pr-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base font-medium placeholder:text-muted-foreground/40 transition"
                />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <button
                onClick={onSubmit}
                disabled={loading || value.length < 10}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
                {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    : 'Send Code'}
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
                <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
                    <button onClick={() => setCurrentPage('splash')} className="flex items-center gap-2 hover:opacity-70 transition">
                        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-black text-xs">B</span>
                        </div>
                        <span className="text-lg font-black text-foreground">Butsó</span>
                    </button>
                    {/* Toggle tabs */}
                    <div className="flex items-center bg-secondary rounded-xl p-1 gap-1">
                        {(['signup', 'login'] as Panel[]).map(p => (
                            <button
                                key={p}
                                onClick={() => setPanel(p)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${panel === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {p === 'signup' ? 'Sign Up' : 'Log In'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main — sliding panels */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <div className="w-full max-w-md relative">
                    <AnimatePresence mode="wait">

                        {/* ── SIGN UP ── */}
                        {panel === 'signup' && (
                            <motion.div
                                key="signup"
                                initial={{ x: -40, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -40, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            >
                                <AnimatePresence mode="wait">

                                    {/* Step 1: Role */}
                                    {signupStep === 'role' && (
                                        <motion.div key="role" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                                            <div className="text-center mb-2">
                                                <h1 className="text-2xl font-black text-foreground mb-1">Join Butsó</h1>
                                                <p className="text-muted-foreground text-sm">What are you here for?</p>
                                            </div>

                                            <button
                                                onClick={() => handleRoleSelect('worker')}
                                                className="w-full p-5 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition group"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <span className="text-3xl">🛠️</span>
                                                    <div>
                                                        <p className="font-black text-foreground text-base mb-1">I'm looking for work</p>
                                                        <p className="text-sm text-muted-foreground">Find jobs near you — plumbing, cleaning, carpentry and more</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => handleRoleSelect('employer')}
                                                className="w-full p-5 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition group"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <span className="text-3xl">📋</span>
                                                    <div>
                                                        <p className="font-black text-foreground text-base mb-1">I need to hire someone</p>
                                                        <p className="text-sm text-muted-foreground">Post a job and get reliable people to help you fast</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <p className="text-center text-sm text-muted-foreground">
                                                Already have an account?{' '}
                                                <button onClick={() => setPanel('login')} className="text-primary font-bold hover:underline">Log in</button>
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Phone */}
                                    {signupStep === 'phone' && (
                                        <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                            <div>
                                                <button onClick={() => setSignupStep('role')} className="text-sm text-muted-foreground hover:text-foreground transition mb-4 flex items-center gap-1">
                                                    ← Back
                                                </button>
                                                <h1 className="text-2xl font-black text-foreground mb-1">Your phone number</h1>
                                                <p className="text-muted-foreground text-sm">We'll send a 4-digit code to verify</p>
                                            </div>
                                            {phoneInput(phone, setPhone, phoneError, handlePhoneSubmit, isLoading)}
                                        </motion.div>
                                    )}

                                    {/* Step 3: OTP */}
                                    {signupStep === 'otp' && (
                                        <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                            <div>
                                                <button onClick={() => { setSignupStep('phone'); setOtp(['', '', '', '']) }} className="text-sm text-muted-foreground hover:text-foreground transition mb-4">
                                                    ← Back
                                                </button>
                                                <h1 className="text-2xl font-black text-foreground mb-1">Enter the code</h1>
                                                <p className="text-muted-foreground text-sm">Sent to +234{phone}</p>
                                            </div>
                                            {renderOtpBoxes(
                                                otp,
                                                (i, v) => handleOtpChange(i, v, otp, setOtp, otpRefs, handleOtpVerify),
                                                (i, e) => handleOtpKeyDown(i, e, otp, otpRefs),
                                                e => handleOtpPaste(e, setOtp, otpRefs, handleOtpVerify),
                                                otpRefs,
                                                isLoading
                                            )}
                                            {isLoading && (
                                                <div className="flex items-center justify-center gap-2 text-primary">
                                                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                    <span className="text-sm">Verifying...</span>
                                                </div>
                                            )}
                                            <button onClick={() => { setOtp(['', '', '', '']); setTimeout(() => otpRefs.current[0]?.focus(), 50) }}
                                                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition">
                                                Resend code
                                            </button>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* ── LOG IN ── */}
                        {panel === 'login' && (
                            <motion.div
                                key="login"
                                initial={{ x: 40, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 40, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            >
                                <AnimatePresence mode="wait">

                                    {/* Login: Phone */}
                                    {loginStep === 'phone' && (
                                        <motion.div key="lphone" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                                            <div>
                                                <h1 className="text-2xl font-black text-foreground mb-1">Welcome back</h1>
                                                <p className="text-muted-foreground text-sm">Enter your number to log in</p>
                                            </div>
                                            {phoneInput(loginPhone, setLoginPhone, loginError, handleLoginPhone, loginLoading)}
                                            <p className="text-center text-sm text-muted-foreground">
                                                No account yet?{' '}
                                                <button onClick={() => setPanel('signup')} className="text-primary font-bold hover:underline">Sign up</button>
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Login: OTP */}
                                    {loginStep === 'otp' && (
                                        <motion.div key="lotp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                            <div>
                                                <button onClick={() => { setLoginStep('phone'); setLoginOtp(['', '', '', '']) }} className="text-sm text-muted-foreground hover:text-foreground transition mb-4">
                                                    ← Back
                                                </button>
                                                <h1 className="text-2xl font-black text-foreground mb-1">Enter the code</h1>
                                                <p className="text-muted-foreground text-sm">Sent to +234{loginPhone}</p>
                                            </div>
                                            {renderOtpBoxes(
                                                loginOtp,
                                                (i, v) => handleOtpChange(i, v, loginOtp, setLoginOtp, loginOtpRefs, handleLoginVerify),
                                                (i, e) => handleOtpKeyDown(i, e, loginOtp, loginOtpRefs),
                                                e => handleOtpPaste(e, setLoginOtp, loginOtpRefs, handleLoginVerify),
                                                loginOtpRefs,
                                                loginLoading
                                            )}
                                            {loginLoading && (
                                                <div className="flex items-center justify-center gap-2 text-primary">
                                                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                    <span className="text-sm">Verifying...</span>
                                                </div>
                                            )}
                                            <button onClick={() => { setLoginOtp(['', '', '', '']); setTimeout(() => loginOtpRefs.current[0]?.focus(), 50) }}
                                                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition">
                                                Resend code
                                            </button>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}