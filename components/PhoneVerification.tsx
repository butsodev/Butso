'use client'

import { motion } from 'framer-motion'
import { Phone, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppStore, type UserRole } from '@/lib/store'

export function PhoneVerification() {
  const { setCurrentPage } = useAppStore()
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  // PHASE 1 FIX: OTP stored as array of individual digits
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // PHASE 1 FIX: Refs for each OTP box to control focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

  const handlePhoneSubmit = () => {
    if (phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    setError('')
    setIsLoading(true)
    setTimeout(() => {
      sessionStorage.setItem('userPhone', phone)
      setStep('otp')
      setIsLoading(false)
      // Auto-focus first OTP box when step changes
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }, 1000)
  }

  const handleOtpSubmit = () => {
    const code = otp.join('')
    if (code.length !== 4) return
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPage('profile-setup')
      setIsLoading(false)
    }, 800)
  }

  // FIXED: Auto-advance to next box on input, auto-submit when complete
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits — strip everything else
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    if (digit) {
      // Always move to next box immediately
      const nextIndex = index + 1
      if (nextIndex < 4) {
        // Small timeout ensures state update before focus shift
        requestAnimationFrame(() => {
          otpRefs.current[nextIndex]?.focus()
          otpRefs.current[nextIndex]?.select()
        })
      }
      // Auto-submit when all 4 filled
      if (newOtp.every(d => d !== '')) {
        setTimeout(() => handleOtpVerify(newOtp), 150)
      }
    }
  }

  // PHASE 1 FIX: Handle backspace — go back to previous box
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // PHASE 1 FIX: Handle paste — fill all boxes from pasted value
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length > 0) {
      const newOtp = ['', '', '', '']
      pasted.split('').forEach((char, i) => { newOtp[i] = char })
      setOtp(newOtp)
      const lastFilled = Math.min(pasted.length, 3)
      otpRefs.current[lastFilled]?.focus()
      if (pasted.length === 4) {
        setTimeout(() => handleOtpVerify(newOtp), 150)
      }
    }
  }

  const handleOtpVerify = (digits: string[]) => {
    const code = digits.join('')
    if (code.length !== 4) return
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPage('profile-setup')
      setIsLoading(false)
    }, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => setCurrentPage('splash')}
            className="inline-flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity"
          >
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">B</span>
            </div>
            <span className="text-xl font-black text-foreground">Butsó</span>
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Phone className="text-primary" size={28} />
          </div>

          <h1 className="text-2xl font-black text-foreground mb-2">
            {step === 'phone' ? 'Enter Your Phone Number' : 'Enter the Code'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {step === 'phone'
              ? "We'll send you a 4-digit code to verify"
              : `Code sent to ${phone}. Check your SMS.`}
          </p>
        </motion.div>

        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Phone Step */}
          {step === 'phone' && (
            <>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                  +234
                </div>
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => {
                    setError('')
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                  className="w-full pl-16 pr-16 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-lg font-medium placeholder:text-muted-foreground/50 transition"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  {phone.length}/11
                </span>
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              <button
                onClick={handlePhoneSubmit}
                disabled={isLoading || phone.length < 10}
                className="w-full py-4 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Code...
                  </span>
                ) : (
                  <>Send Code <ChevronRight size={20} /></>
                )}
              </button>
            </>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <>
              {/* PHASE 1 FIX: Individual boxes with auto-advance */}
              <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-16 h-16 border-2 rounded-xl text-center text-2xl font-black focus:outline-none transition
                      ${digit
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-foreground focus:border-primary'
                      }`}
                  />
                ))}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-primary py-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm font-medium">Verifying...</span>
                </div>
              )}

              {/* Resend */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setOtp(['', '', '', ''])
                    setTimeout(() => otpRefs.current[0]?.focus(), 50)
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  Didn't get the code? <span className="font-semibold text-primary">Resend</span>
                </button>
              </div>

              {/* Manual verify button — shown if auto-submit somehow doesn't fire */}
              {otp.every(d => d !== '') && (
                <button
                  onClick={() => handleOtpVerify(otp)}
                  disabled={isLoading}
                  className="w-full py-4 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 text-lg"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              )}
            </>
          )}

          {/* Back */}
          <button
            onClick={() => {
              if (step === 'otp') {
                setStep('phone')
                setOtp(['', '', '', ''])
              } else {
                setCurrentPage('role-select')
              }
            }}
            className="w-full text-center text-muted-foreground hover:text-foreground transition py-2 text-sm"
          >
            ← Back
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}