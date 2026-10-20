'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, MailCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function ForgotPassword() {
  const openAuth = useAppStore(s => s.openAuth)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const send = async () => {
    if (sending) return
    const clean = email.trim().toLowerCase()
    if (!EMAIL_RE.test(clean)) { setError('Enter the email you signed up with.'); return }
    setError(''); setSending(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(clean, {
      // The reset link returns here; the app shell spots it and opens the new-password screen
      redirectTo: window.location.origin,
    })
    setSending(false)
    if (err) {
      const rateLimited = err.status === 429 || /rate limit|too many/i.test(err.message)
      setError(rateLimited
        ? 'Too many attempts. Please wait a few minutes and try again.'
        : 'Could not send the email. Check your connection and try again.')
      return
    }
    // Same message whether or not the account exists, so nobody can probe which emails are registered
    setSent(true)
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 py-10">
      {sent ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
            <MailCheck size={26} className="text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Check your inbox</h1>
          <p className="text-muted-foreground text-sm">
            If an account exists for <span className="text-foreground font-semibold">{email.trim()}</span>, we sent a link to reset your password. It can take a minute. Check spam too.
          </p>
          <button onClick={() => openAuth('login')} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition text-sm">
            Back to log in
          </button>
          <button onClick={() => { setSent(false) }} className="text-xs font-semibold text-muted-foreground hover:text-foreground py-2">
            Use a different email
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
              <KeyRound size={22} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Forgot your password?</h1>
            <p className="text-muted-foreground text-sm">Enter your email and we will send you a link to set a new one.</p>
          </div>
          <input
            type="email" aria-label="Email address" placeholder="you@example.com" value={email} autoFocus autoComplete="email"
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="w-full px-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base placeholder:text-muted-foreground/40 transition"
          />
          {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={send}
            disabled={sending || !email.includes('@')}
            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
          >
            {sending
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              : 'Send reset link'}
          </motion.button>
          <p className="text-xs text-muted-foreground text-center">
            Signed up with Google or a phone number? You do not have a password to reset. Just use that log in option.
          </p>
        </motion.div>
      )}
    </div>
  )
}
