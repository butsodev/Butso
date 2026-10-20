'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LockKeyhole } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { isRecovery, clearRecovery } from '@/lib/recovery'
import { showToast } from '@/lib/toast'

type Phase = 'checking' | 'ready' | 'invalid'

export function ResetPassword() {
  const { currentUser, setCurrentPage, openAuth } = useAppStore()
  const [phase, setPhase] = useState<Phase>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // The form only opens for someone who arrived from the reset email AND has a live session
  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setPhase(isRecovery() && data.session ? 'ready' : 'invalid')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && alive) setPhase('ready')
    })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  const save = async () => {
    if (saving) return
    if (password.length < 8) { setError('Use at least 8 characters.'); return }
    if (password !== confirm) { setError('The two passwords do not match.'); return }
    setError(''); setSaving(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (err) {
      setError(/different from the old/i.test(err.message)
        ? 'Choose a password you have not used before.'
        : /weak|at least/i.test(err.message)
          ? 'That password is too weak. Try a longer one.'
          : 'Could not update your password. The link may have expired. Request a new one.')
      return
    }
    clearRecovery()
    showToast('success', 'Password updated.')
    if (currentUser) setCurrentPage('dashboard')
    else openAuth('login')
  }

  if (phase === 'checking') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (phase === 'invalid') {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-10 text-center space-y-4">
        <h1 className="text-2xl font-black text-foreground tracking-tight">This link has expired</h1>
        <p className="text-muted-foreground text-sm">Reset links work once and only for a short time. Request a fresh one.</p>
        <button onClick={() => setCurrentPage('forgot-password')} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition text-sm">
          Send a new link
        </button>
        <button onClick={() => openAuth('login')} className="text-xs font-semibold text-muted-foreground hover:text-foreground py-2">Back to log in</button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
            <LockKeyhole size={22} className="text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Set a new password</h1>
          <p className="text-muted-foreground text-sm">Choose a password you will remember. At least 8 characters.</p>
        </div>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'} aria-label="New password" placeholder="New password" value={password} autoFocus autoComplete="new-password"
            onChange={e => { setPassword(e.target.value); setError('') }}
            className="w-full px-4 py-4 pr-16 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base placeholder:text-muted-foreground/40 transition"
          />
          <button type="button" onClick={() => setShow(v => !v)} aria-pressed={show} aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition">
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          type={show ? 'text' : 'password'} aria-label="Confirm new password" placeholder="Confirm new password" value={confirm} autoComplete="new-password"
          onChange={e => { setConfirm(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && save()}
          className="w-full px-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base placeholder:text-muted-foreground/40 transition"
        />
        {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
        <motion.button
          whileTap={{ scale: 0.97 }} onClick={save}
          disabled={saving || password.length < 8 || !confirm}
          className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
        >
          {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : 'Update password'}
        </motion.button>
      </motion.div>
    </div>
  )
}
