'use client'

// Blocks the app for signed-in people who have not confirmed their age, or who have not
// accepted the CURRENT Terms and Privacy Policy. This is what makes "we updated our terms" work:
// change LEGAL_VERSION in lib/legal.ts and everyone sees the agree screen on their next visit.
import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { signOutUser } from '@/lib/auth'
import { LEGAL_VERSION, ADULT_AGE, ageFromBirthDate } from '@/lib/legal'
import { useLegalStatus } from '@/lib/legalStatus'
import { DateWheelPicker } from '@/components/DateWheelPicker'

type Need = 'none' | 'age' | 'terms'

export function LegalGate() {
  const userId = useAppStore(s => s.currentUser?.id)
  const page = useAppStore(s => s.currentPage)
  const [need, setNeed] = useState<Need>('none')
  const [birthDate, setBirthDate] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [tooYoung, setTooYoung] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const setStatus = useLegalStatus(s => s.set)

  useEffect(() => {
    if (!userId) { setNeed('none'); setStatus('unknown'); return }
    let alive = true
    setStatus('unknown')
    supabase.from('profile_private').select('terms_version').eq('user_id', userId).maybeSingle()
      .then(({ data, error: err }) => {
        if (!alive) return
        if (err) { setStatus('ok'); return } // if this check fails, never lock people out of the app
        const next: Need = !data ? 'age' : data.terms_version !== LEGAL_VERSION ? 'terms' : 'none'
        setNeed(next)
        setStatus(next === 'none' ? 'ok' : 'blocked')
      })
    return () => { alive = false }
  }, [userId, setStatus])

  if (!userId || need === 'none' || page === 'profile-setup') return null

  const leave = async () => { await signOutUser(); useAppStore.getState().setCurrentPage('splash') }

  const accept = async () => {
    setError('')
    if (need === 'age') {
      const age = ageFromBirthDate(birthDate)
      if (age === null) { setError('Please enter a valid date of birth.'); return }
      if (age < ADULT_AGE) { setTooYoung(true); return }
    }
    setBusy(true)
    const { error: err } = await supabase.rpc('accept_terms', { p_version: LEGAL_VERSION, p_birth_date: need === 'age' ? birthDate : null })
    setBusy(false)
    if (err) { setError(err.message.includes('18') ? `Butsó is for people aged ${ADULT_AGE} and over.` : err.message); return }
    setNeed('none')
    setStatus('ok')
  }

  const links = (
    <>
      <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-primary">Terms of Service</a> and{' '}
      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-primary">Privacy Policy</a>
    </>
  )

  return (
    <div className="fixed inset-0 z-[130] bg-background overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="legal-title">
      <div className="max-w-md mx-auto px-6 py-12 space-y-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
          <ShieldCheck size={22} className="text-primary" />
        </div>

        {tooYoung ? (
          <>
            <h1 id="legal-title" className="text-2xl font-black text-foreground tracking-tight">Butsó is for people {ADULT_AGE} and over</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We are working on Junior accounts that a parent or legal guardian can approve, with extra safety rules.
              They are not ready yet. Please come back when you are {ADULT_AGE}.
            </p>
          </>
        ) : need === 'age' ? (
          <>
            <h1 id="legal-title" className="text-2xl font-black text-foreground tracking-tight">Before you continue</h1>
            <p className="text-muted-foreground text-sm">
              We now check that everyone is {ADULT_AGE} or over. Your date of birth stays private. Nobody else sees it.
            </p>
            <div>
              <p className="block text-sm font-bold text-foreground mb-2" aria-hidden="true">Date of birth</p>
              <DateWheelPicker value={birthDate} onChange={setBirthDate} />
            </div>
            <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 accent-primary shrink-0" />
              <span>I confirm I am {ADULT_AGE} or over, and I agree to the {links}.</span>
            </label>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <button onClick={accept} disabled={!birthDate || !agreed || busy}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40">
              {busy ? 'Saving...' : 'Continue'}
            </button>
          </>
        ) : (
          <>
            <h1 id="legal-title" className="text-2xl font-black text-foreground tracking-tight">We updated our Terms and Privacy Policy</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Please read the {links}, then agree to keep using Butsó.
            </p>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <button onClick={accept} disabled={busy}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40">
              {busy ? 'Saving...' : 'I agree'}
            </button>
          </>
        )}

        <button onClick={leave} className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2">Log out</button>
      </div>
    </div>
  )
}
