'use client'

import { motion } from 'framer-motion'
import { Phone, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAppStore, type UserRole } from '@/lib/store'

export function PhoneVerification() {
  const { setCurrentPage } = useAppStore()
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePhoneSubmit = () => {
    if (phone.length < 10) {
      alert('Please enter a valid phone number')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setStep('otp')
      setIsLoading(false)
    }, 1000)
  }

  const handleOtpSubmit = () => {
    if (otp.length !== 4) {
      alert('Please enter a 4-digit OTP')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      const role = sessionStorage.getItem('selectedRole') as UserRole
      setCurrentPage('profile-setup')
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
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <Phone className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {step === 'phone' ? 'Enter Your Phone' : 'Verify OTP'}
          </h1>
          <p className="text-muted-foreground">
            {step === 'phone' 
              ? 'We&apos;ll use this to keep your account secure'
              : 'Enter the 4-digit code sent to your number'}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {step === 'phone' && (
            <>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                <span className="absolute right-4 top-3.5 text-muted-foreground text-sm">
                  {phone.length}/11
                </span>
              </div>
              <button
                onClick={handlePhoneSubmit}
                disabled={isLoading || phone.length < 10}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
                {!isLoading && <ChevronRight size={20} />}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('')
                      newOtp[index] = e.target.value.replace(/\D/g, '')
                      setOtp(newOtp.join(''))
                    }}
                    className="w-12 h-12 border border-border rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                ))}
              </div>
              <button
                onClick={handleOtpSubmit}
                disabled={isLoading || otp.length !== 4}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (step === 'otp') {
                setStep('phone')
                setOtp('')
              } else {
                setCurrentPage('role-select')
              }
            }}
            className="w-full text-center text-muted-foreground hover:text-foreground transition py-2"
          >
            ← Back
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
